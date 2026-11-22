// Explicit test-only shape: releaseCoverageContent; no original data fetched.
import {kiiikiiiDebutCampaign,releaseCoverageContent} from "../synthetic-artist-content";
const content=releaseCoverageContent("rec28ldfRTiBUk","合成宿主 kiiikiii");
export default {...content,debutCampaign:kiiikiiiDebutCampaign(content.hero.image)};
