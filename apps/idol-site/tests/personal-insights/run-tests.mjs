/**
 * Run only after the feature has been restored to the real project.
 * Uses existing Node >=22.13, TypeScript 5.9, React 19 and react-dom 19.
 * No installation, network, data fetching or product-module mocks.
 *
 * 1. Strictly typecheck the feature, its actual imports and all local fixtures.
 * 2. Mirror actual TypeScript implementations to a temporary ESM output folder.
 * 3. Execute exactly the three Node test files below.
 *
 * The one explicit CSS side-effect import is omitted for SSR only. Browser
 * checks use the real stylesheet and run separately; they are never Node cases.
 * Authoring checkpoint: not_run.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const projectRoot = await fs.realpath(fileURLToPath(new URL('../../', import.meta.url)));
const configPath = path.join(projectRoot, 'tests/personal-insights/tsconfig.json');
const requireFromProject = createRequire(path.join(projectRoot, 'package.json'));
const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number);
if (nodeMajor < 22 || (nodeMajor === 22 && nodeMinor < 13)) {
  throw new Error('personal-insights tests require Node >=22.13; found ' + process.versions.node);
}
let ts;
let reactVersion;
let reactDomVersion;
try {
  ts = requireFromProject('typescript');
  reactVersion = requireFromProject('react/package.json').version;
  reactDomVersion = requireFromProject('react-dom/package.json').version;
} catch (error) {
  throw new Error('Restore the existing project dependencies; no packages are installed by this runner.', { cause: error });
}
if (!/^5\.9\./.test(ts.version)) {
  throw new Error('Expected existing TypeScript 5.9.x; found ' + ts.version);
}
if (!/^19\./.test(reactVersion) || !/^19\./.test(reactDomVersion)) {
  throw new Error('Expected existing React/react-dom 19.x; found ' + reactVersion + '/' + reactDomVersion);
}

const diagnosticHost = {
  getCanonicalFileName: (name) => name,
  getCurrentDirectory: () => projectRoot,
  getNewLine: () => '\n',
};
function failDiagnostics(diagnostics) {
  if (diagnostics.length === 0) return;
  process.stderr.write(ts.formatDiagnosticsWithColorAndContext(diagnostics, diagnosticHost));
  throw new Error('Strict feature typecheck failed; Node tests were not started.');
}
const readConfig = ts.readConfigFile(configPath, ts.sys.readFile);
failDiagnostics(readConfig.error ? [readConfig.error] : []);
const parsed = ts.parseJsonConfigFileContent(readConfig.config, ts.sys, path.dirname(configPath), undefined, configPath);
failDiagnostics(parsed.errors);
const program = ts.createProgram({
  rootNames: parsed.fileNames, options: parsed.options,
  projectReferences: parsed.projectReferences,
});
failDiagnostics(ts.getPreEmitDiagnostics(program));
process.stdout.write('Strict TypeScript feature check passed. SSR/source tests follow; browser checks are separate.\n');

const tempPrefix = '.personal-insights-tests-';
const outputRoot = await fs.mkdtemp(path.join(projectRoot, tempPrefix));
const explicitSsrCss = path.join(projectRoot, 'components/personal-insights/personal-insights.css');
const ignoredStyles = new Set();
let exitCode = 1;

function relativeInsideRoot(filename) {
  const relative = path.relative(projectRoot, path.resolve(filename));
  if (!relative || path.isAbsolute(relative) || relative === '..' || relative.startsWith('..' + path.sep)) {
    throw new Error('Source escaped the restored project: ' + filename);
  }
  return relative;
}
function outputFile(filename) {
  return path.join(outputRoot, relativeInsideRoot(filename).replace(/\.(?:tsx?|mts|cts)$/i, '.js'));
}
function rewriteSpecifier(specifier, importer) {
  const resolved = ts.resolveModuleName(specifier, importer, parsed.options, ts.sys).resolvedModule;
  if (!resolved) {
    if (specifier.startsWith('.') || path.isAbsolute(specifier)) {
      throw new Error('Unresolved local runtime import: ' + importer + ' -> ' + specifier);
    }
    return specifier;
  }
  if (resolved.isExternalLibraryImport || /\.d\.(?:ts|mts|cts)$/i.test(resolved.resolvedFileName)) {
    return specifier;
  }
  if (!/\.(?:tsx?|mts|cts)$/i.test(resolved.resolvedFileName)) {
    throw new Error('Unsupported local runtime dependency: ' + resolved.resolvedFileName);
  }
  let relative = path.relative(path.dirname(outputFile(importer)), outputFile(resolved.resolvedFileName));
  relative = relative.split(path.sep).join('/');
  return relative.startsWith('.') ? relative : './' + relative;
}
function transformImports(importer) {
  return (context) => {
    const factory = context.factory;
    const visit = (node) => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const specifier = node.moduleSpecifier.text;
        if (specifier.endsWith('.css')) {
          const cssPath = path.resolve(path.dirname(importer), specifier);
          if (cssPath !== explicitSsrCss || node.importClause || !ts.sys.fileExists(cssPath)) {
            throw new Error('Unregistered or missing SSR stylesheet: ' + importer + ' -> ' + specifier);
          }
          ignoredStyles.add(path.relative(projectRoot, cssPath).split(path.sep).join('/'));
          return undefined;
        }
        return factory.updateImportDeclaration(
          node, node.modifiers, node.importClause,
          factory.createStringLiteral(rewriteSpecifier(specifier, importer)), node.attributes,
        );
      }
      if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        return factory.updateExportDeclaration(
          node, node.modifiers, node.isTypeOnly, node.exportClause,
          factory.createStringLiteral(rewriteSpecifier(node.moduleSpecifier.text, importer)), node.attributes,
        );
      }
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword
        && node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0])) {
        return factory.updateCallExpression(node, node.expression, node.typeArguments, [
          factory.createStringLiteral(rewriteSpecifier(node.arguments[0].text, importer)),
        ]);
      }
      return ts.visitEachChild(node, visit, context);
    };
    return (source) => ts.visitNode(source, visit);
  };
}

try {
  await fs.writeFile(path.join(outputRoot, 'package.json'), '{"type":"module"}\n', 'utf8');
  const implementations = program.getSourceFiles().filter((source) => (
    !source.isDeclarationFile && !program.isSourceFileFromExternalLibrary(source)
  ));
  for (const source of implementations) {
    if (!/\.(?:tsx?|mts|cts)$/i.test(source.fileName)) {
      throw new Error('Unexpected implementation input: ' + source.fileName);
    }
    const result = ts.transpileModule(source.text, {
      fileName: source.fileName,
      compilerOptions: {
        ...parsed.options, noEmit: false, declaration: false, declarationMap: false,
        module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX, sourceMap: false, inlineSourceMap: false,
        importHelpers: false,
      },
      reportDiagnostics: true,
      transformers: { before: [transformImports(source.fileName)] },
    });
    failDiagnostics(result.diagnostics ?? []);
    const destination = outputFile(source.fileName);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, result.outputText, 'utf8');
  }
  if (ignoredStyles.size !== 1) {
    throw new Error('Expected the one explicit personal-insights SSR stylesheet import.');
  }
  process.stdout.write('SSR-only omitted style: ' + [...ignoredStyles].join(', ') + '\n');
  const cases = ['model.test.js', 'properties.test.js', 'component.test.js']
    .map((name) => path.join(outputRoot, 'tests/personal-insights', name));
  for (const filename of cases) await fs.access(filename);
  const child = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...cases], {
    cwd: projectRoot,
    env: { ...process.env, PERSONAL_INSIGHTS_SOURCE_ROOT: projectRoot },
    stdio: 'inherit',
    shell: false,
  });
  if (child.error) throw child.error;
  if (child.signal) throw new Error('Node test process stopped by signal ' + child.signal);
  exitCode = child.status ?? 1;
} finally {
  // Verify the absolute target before the only recursive deletion in this file.
  const resolvedOutput = await fs.realpath(outputRoot);
  if (path.dirname(resolvedOutput) !== projectRoot || !path.basename(resolvedOutput).startsWith(tempPrefix)) {
    throw new Error('Refusing cleanup outside this runner project directory: ' + resolvedOutput);
  }
  await fs.rm(resolvedOutput, { recursive: true, force: true });
}
process.exitCode = exitCode;
