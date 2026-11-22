import {importEditorialWorks, previewEditorialWorks} from '@/lib/idol/editorial-work-import';
import {AppError} from '@/lib/idol/feishu';
import {failure, json, requireUser, sameOrigin} from '@/lib/idol/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireUser();
    return json(await previewEditorialWorks(user.userId));
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    sameOrigin(request);
    if (new URL(request.url).search) {
      throw new AppError('INVALID_OPERATION', '本次操作只可导入已选定的两个版本。', 400);
    }
    const reader = request.body?.getReader();
    if (reader) {
      try {
        for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
          if (chunk.value.byteLength) {
            await reader.cancel();
            throw new AppError('INVALID_OPERATION', '本次操作只可导入已选定的两个版本。', 400);
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
    return json(await importEditorialWorks(user.userId, request.headers.get('Idempotency-Key') ?? ''));
  } catch (error) {
    return failure(error);
  }
}
