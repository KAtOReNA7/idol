'use client';
import { useEffect, useRef, useState } from 'react';
import { boundedAssetBody } from '@/lib/idol/editorial-asset-service';
import { EDITORIAL_BACKUP_WIRE_MAX } from '@/lib/idol/editorial-asset-backup-codec';
import { clearVerifiedPilotLock, pilotCatalog, pilotLockKey, pilotState, pilotUrl, readPilotLock, setPilotLock, verifyPilotBackup, verifyPilotOriginal } from '@/lib/idol/editorial-asset-ui';
import type { PilotCatalog, PilotEntry } from '@/lib/idol/editorial-asset-ui';
import type { AssetState } from '@/lib/idol/editorial-asset-types';
type RowState = AssetState | 'unchecked';
const labels: Record<RowState, string> = { unchecked: '尚未核验', missing: '当前未见对象', verified: '原字节已核验', unknown: '结果未知 · 停止写入', conflict: '对象冲突 · 停止写入' };
async function call(path: string, options: RequestInit = {}, max = 20000) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 30000);
    try {
        const response = await fetch(path, { ...options, credentials: 'same-origin', mode: 'same-origin', redirect: 'error', cache: 'no-store', signal: controller.signal });
        if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('PILOT_RESPONSE');
        const bytes = await boundedAssetBody(response.body, max, 10000);
        return { response, bytes, value: JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) as unknown };
    } finally { clearTimeout(timer); }
}
export default function EditorialAssetsClient() {
    const [catalog, setCatalog] = useState<PilotCatalog | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
    const [states, setStates] = useState<Record<string, RowState>>({}), [files, setFiles] = useState<Record<string, File>>({});
    const [backupFile, setBackupFile] = useState<File | null>(null), [backupChecked, setBackupChecked] = useState(false), [restoreConsent, setRestoreConsent] = useState(false), [guardReady, setGuardReady] = useState(false);
    const running = useRef(false);
    function guard(c: PilotCatalog, testWritable = true) {
        try {
            if (testWritable) {
                const probe = 'editorial-assets-ui-probe'; localStorage.setItem(probe, '1');
                if (localStorage.getItem(probe) !== '1') throw new Error('storage'); localStorage.removeItem(probe);
            }
            setStates(previous => Object.fromEntries(c.entries.map(e => [e.assetId, readPilotLock(localStorage, e) ? 'unknown' : previous[e.assetId] ?? 'unchecked'])));
            setGuardReady(true); return true;
        } catch { setGuardReady(false); return false; }
    }
    async function loadCatalog() {
        const result = await call('/api/manage/editorial-assets/catalog');
        if (!result.response.ok) throw new Error('PILOT_AUTH');
        const c = pilotCatalog(result.value); setCatalog(c); guard(c); return c;
    }
    async function run(action: () => Promise<void>) {
        if (running.current) return;
        running.current = true; setBusy(true); setError(''); setNotice('');
        try { await action(); }
        catch { setError('操作未完成。请先使用现有站点所有者会话，并只读核验当前状态；不要重新提交结果未知的写入。'); }
        finally { running.current = false; setBusy(false); }
    }
    // Loading catalog is read-only; no automatic status polling, upload, restore, or retries.
    useEffect(() => { let mounted = true; void call('/api/manage/editorial-assets/catalog').then(result => {
        if (!mounted) return; if (!result.response.ok) throw new Error('PILOT_AUTH');
        const c = pilotCatalog(result.value); setCatalog(c); guard(c);
    }).catch(() => { if (mounted) setError('请通过现有站点所有者会话打开此页。当前目录尚未获准读取。'); }); return () => { mounted = false; }; }, []);
    useEffect(() => {
        if (!catalog) return;
        const changed = (event: StorageEvent) => {
            if (event.storageArea === localStorage && (event.key === null || catalog.entries.some(e => pilotLockKey(e) === event.key))) guard(catalog, false);
        };
        window.addEventListener('storage', changed);
        return () => window.removeEventListener('storage', changed);
    }, [catalog]);
    useEffect(() => {
        if (!busy) return;
        const leave = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener('beforeunload', leave);
        return () => window.removeEventListener('beforeunload', leave);
    }, [busy]);
    function acceptState(c: PilotCatalog, e: PilotEntry, value: unknown) {
        let state = pilotState(value, c, e);
        try {
            if (state === 'verified') clearVerifiedPilotLock(localStorage, e, state);
            else if (readPilotLock(localStorage, e) && state === 'missing') state = 'unknown';
        } catch { setGuardReady(false); }
        setStates(previous => ({ ...previous, [e.assetId]: state })); return state;
    }
    async function status(c: PilotCatalog, e: PilotEntry) {
        try {
            const result = await call(pilotUrl(c, e));
            // Status route returns JSON state only after full auth/scope/target checks.
            if (!result.response.ok) throw new Error('PILOT_STATUS');
            return acceptState(c, e, result.value);
        } catch { setStates(previous => ({ ...previous, [e.assetId]: 'unknown' })); throw new Error('PILOT_STATUS'); }
    }
    function reserve(e: PilotEntry) {
        if (!guardReady || readPilotLock(localStorage, e)) throw new Error('PILOT_VERIFY_REQUIRED');
        setPilotLock(localStorage, e);
        setStates(previous => ({ ...previous, [e.assetId]: 'unknown' }));
    }
    async function choose(file: File | undefined, e: PilotEntry) {
        if (!file) return;
        setFiles(previous => { const next = { ...previous }; delete next[e.assetId]; return next; });
        await verifyPilotOriginal(file, e); setFiles(previous => ({ ...previous, [e.assetId]: file }));
        setNotice(`${e.label}：本地文件 SHA、长度及图片头匹配。尚未上传。`);
    }
    async function upload(c: PilotCatalog, e: PilotEntry) {
        if (!c.policy.read || !c.policy.write || !files[e.assetId] || !guardReady || c.entries.some(item => readPilotLock(localStorage, item) || ['unknown', 'conflict'].includes(states[item.assetId]))) throw new Error('PILOT_DISABLED');
        if (await status(c, e) !== 'missing' || readPilotLock(localStorage, e)) throw new Error('PILOT_VERIFY_REQUIRED');
        const bytes = await verifyPilotOriginal(files[e.assetId], e);
        reserve(e); // Persist uncertainty BEFORE a request can leave the browser. No timeout/refresh clearing.
        const result = await call(pilotUrl(c, e), { method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: new Uint8Array(bytes).buffer });
        if (!result.response.ok) throw new Error('PILOT_UNKNOWN');
        const state = acceptState(c, e, result.value);
        if (state !== 'verified') throw new Error('PILOT_UNKNOWN');
        setNotice(`${e.label}：服务端已完整读回核验。正式页面未替换；候选页单独读取。`);
    }
    async function download(c: PilotCatalog) {
        if (!c.policy.recovery) throw new Error('PILOT_DISABLED');
        const result = await call('/api/manage/editorial-assets/backup?manifest=' + c.manifestHash, {}, EDITORIAL_BACKUP_WIRE_MAX);
        if (!result.response.ok) throw new Error('PILOT_BACKUP');
        const blob = new Blob([new Uint8Array(result.bytes).buffer], { type: 'application/json' });
        await verifyPilotBackup(blob, c);
        const url = URL.createObjectURL(blob), link = document.createElement('a');
        link.href = url; link.download = `editorial-assets-${c.manifestHash}.json`; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        setNotice('已核验备份并发起下载。请确认文件已保存；此文件只含UDTT 11 图及保留的历史，不是全站备份。');
    }
    async function chooseBackup(file: File | undefined, c: PilotCatalog) {
        setBackupFile(null); setBackupChecked(false); setRestoreConsent(false);
        if (!file) return; await verifyPilotBackup(file, c);
        setBackupFile(file); setBackupChecked(true); setNotice('备份与当前可信清单及全部原字节匹配。尚未发送恢复请求。');
    }
    async function restore(c: PilotCatalog) {
        if (!c.policy.read || !c.policy.write || !c.policy.recovery || !guardReady || !backupChecked || !backupFile || !restoreConsent) throw new Error('PILOT_DISABLED');
        const text = await verifyPilotBackup(backupFile, c);
        for (const e of c.entries) {
            const state = await status(c, e);
            if (state !== 'verified' && state !== 'missing') throw new Error('PILOT_VERIFY_REQUIRED');
        }
        // The server rechecks all objects; any entry could become missing after browser preflight.
        for (const e of c.entries) reserve(e);
        const result = await call('/api/manage/editorial-assets/restore?manifest=' + c.manifestHash, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: text });
        if (!result.response.ok || !result.value || typeof result.value !== 'object' || !('complete' in result.value) || result.value.complete !== true) throw new Error('PILOT_UNKNOWN');
        // A restore response alone never clears browser guards. User explicitly verifies each exact key.
        setRestoreConsent(false); setNotice('恢复请求返回完成。请逐图点击“只读核验”取得 verified 后继续；不会覆盖已有对象。');
    }
    const blocked = !catalog || !guardReady || busy;
    const writeStopped = !!catalog?.entries.some(e => states[e.assetId] === 'unknown' || states[e.assetId] === 'conflict');
    return <main className="editorial-pilot">
        <a href="/manage">← 管理资料</a><header><p className="eyebrow">PRIVATE · UDTT RETAINED-BYTE PILOT</p><h1>UDTT 原字节管理</h1><p>仅 UDTT 既有 11 个图片槽位。不修改评分、备注或观看状态。</p></header>
        <section className="pilot-notice"><strong>UDTT 受控迁移，非正式页面替换</strong><p>保留现有图片与绑定，不重新选图。团体图不称出版原图；Woojung 槽位仅保留既有站点字节，出版方具名身份旁证仍不完整。目标每次由服务端核验。账户剩余额度未知、计费未确认；本页不能开启权限。</p><p>任何冲突、未知结果或额度/计费错误都停止写入，不自动重试，只做读取核验。本机标记仅是额外保护，不是跨设备、跨实例或重启后的服务端保证。不要通过刷新、清除浏览器存储或更换会话绕过未知结果。</p></section>
        {error && <p className="pilot-error" role="alert">{error}</p>}{notice && <p className="pilot-notice" role="status">{notice}</p>}
        {!catalog ? <button disabled={busy} onClick={() => void run(async () => { await loadCatalog(); })}>读取 UDTT 目录</button> : <>
            <p className="pilot-policy">读取：{catalog.policy.read ? '开启' : '关闭'} · 上传：{catalog.policy.write ? '开启' : '关闭'} · 备份/恢复：{catalog.policy.recovery ? '开启' : '关闭'} · 展示映射：{catalog.activeCount}</p>
            {!guardReady && <p role="alert">本机未知结果保护不可用，已禁用写入。仍可只读核验。</p>}
            <p className="pilot-hash">可信清单 SHA：{catalog.manifestHash}</p>
            <div className="pilot-grid">{catalog.entries.map(e => <section className="pilot-card" key={e.assetId}><h2>{e.label}</h2><p>{e.width} × {e.height} · {e.byteLength.toLocaleString()} bytes · {e.mime}</p><p className="pilot-hash">SHA：{e.sha256}</p><p role="status"><strong>{labels[states[e.assetId] ?? 'unchecked']}</strong></p>
                <button disabled={busy || !catalog.policy.read} onClick={() => void run(async () => { await status(catalog, e); })}>只读核验</button>
                <label>选择对应本地原始文件<input type="file" accept="image/jpeg,image/png,image/webp" disabled={blocked || !catalog.policy.write} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; void run(() => choose(file, e)); }} /></label>
                <small>{files[e.assetId] ? '本地原字节已匹配，未自动上传' : '未选择文件'}</small>
                <button disabled={blocked || writeStopped || !catalog.policy.read || !catalog.policy.write || !files[e.assetId] || states[e.assetId] !== 'missing'} onClick={() => void run(() => upload(catalog, e))}>仅创建缺失原图</button>
                {catalog.policy.read && states[e.assetId] === 'verified' && <a href={pilotUrl(catalog, e, true)} download>下载已核验原字节</a>}
            </section>)}</div>
            <section className="pilot-card"><h2>独立 UDTT 备份与受控恢复</h2><p>保留全部历史清单及原字节。恢复只补缺图，不覆盖、不删除；不能代替全站资料备份。</p>
                <button disabled={busy || !catalog.policy.recovery} onClick={() => void run(() => download(catalog))}>核验并下载备份</button>
                <label>选择此前保存的UDTT JSON 备份<input type="file" accept="application/json,.json" disabled={blocked || !catalog.policy.write || !catalog.policy.recovery} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; void run(() => chooseBackup(file, catalog)); }} /></label>
                <p>{backupChecked ? '本地备份已核验，尚未发送' : '备份需先匹配当前可信清单并核验全部字节'}</p>
                <label className="pilot-check"><input type="checkbox" checked={restoreConsent} disabled={blocked || !backupChecked} onChange={e => setRestoreConsent(e.target.checked)} />我确认仅在当前同一私有范围补齐缺失原图，保留所有已有对象。</label>
                <button disabled={blocked || !catalog.policy.read || !catalog.policy.write || !catalog.policy.recovery || !backupChecked || !restoreConsent || catalog.entries.some(e => states[e.assetId] === 'unknown' || states[e.assetId] === 'conflict')} onClick={() => void run(() => restore(catalog))}>核验状态并仅补缺图</button>
            </section>
        </>}
        <footer>仅使用现有所有者会话。不接受图片网址、对象 key 或凭证；不会自动重试。</footer>
    </main>;
}
