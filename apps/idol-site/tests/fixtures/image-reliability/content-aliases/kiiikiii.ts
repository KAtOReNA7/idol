// Exact image fixture data shape, generated only in tests.
import {releaseImageContent} from "../synthetic-content";
import {kiiikiiiDebutCampaign} from "../../timeline-host/synthetic-artist-content";
const content=releaseImageContent("kiiikiii","rec28ldfRTiBUk");
export default {...content,debutCampaign:kiiikiiiDebutCampaign(content.hero.image)};
