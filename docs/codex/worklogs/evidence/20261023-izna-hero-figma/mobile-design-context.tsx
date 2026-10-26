// Figma get_design_context evidence only; not application source.
// Temporary Figma asset URL removed. Original PNG already exists in apps/idol-site/public/artist/izna/batch-b-20261016/group-original.png.
const assetPathPrefix = "[REDACTED_TEMPORARY_ASSET_PREFIX]";
const imgOfficialGroupPortraitFullImage = `${assetPathPrefix}/4e013.png`;

export default function PhotoLedOpening20261023() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center relative size-full" data-node-id="812:19348" data-name="Photo-led opening · 2026-10-23">
      <div className="h-[501.2px] overflow-clip relative shrink-0 w-[358px]" data-node-id="812:19354" data-name="Official group portrait · full image">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgOfficialGroupPortraitFullImage} />
      </div>
      <div className="[word-break:break-word] content-stretch flex h-[44px] items-center justify-between relative shrink-0 w-[358px] whitespace-nowrap" data-node-id="812:19352" data-name="Navigation below photograph">
        <p className="font-['Noto_Sans_SC:Regular'] font-normal leading-[1.45] relative shrink-0 text-[14px] text-[color:var(----izna-ink,#f5f4f7)]" data-node-id="812:19343">
          成员 →
        </p>
        <p className="font-['Noto_Sans_SC:Regular'] font-normal leading-[1.45] relative shrink-0 text-[14px] text-[color:var(----izna-ink,#f5f4f7)]" data-node-id="812:19344">
          作品 →
        </p>
        <p className="font-['Noto_Sans_SC:Regular'] font-normal leading-[1.45] relative shrink-0 text-[14px] text-[color:var(----izna-ink,#f5f4f7)]" data-node-id="812:19345">
          时间轴 →
        </p>
        <a className="block font-['Noto_Sans_SC:Bold'] font-bold leading-[0] relative shrink-0 text-[12px] text-[color:var(----izna-muted,#a8adbc)]" href="https://cdn.wake-one.com/wp-content/uploads/2026/08/07091746/%EC%9B%A8%EC%9D%B4%ED%81%AC%EC%9B%90-%ED%94%84%EB%A1%9C%ED%95%84_%EB%8B%A8%EC%B2%B4_%EC%84%B8%EB%A1%9C.png" data-node-id="812:19353" target="_blank">
          <p className="cursor-pointer leading-[1.45]">查看原图 ↗</p>
        </a>
      </div>
    </div>
  );
}
