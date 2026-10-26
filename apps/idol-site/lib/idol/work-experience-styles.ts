import {candidateExperienceStylesheet} from './candidate/experience-styles';
import bm from '@/app/babymonster-experience.css?url';
import illit from '@/app/illit-experience.css?url';
import expanded from '@/app/expanded-experience.css?url';
import ive from '@/app/ive-experience.css?url';
import kiof from '@/app/kiof-experience.css?url';
import stayc from '@/app/stayc-experience.css?url';
import nmixx from '@/app/nmixx-experience.css?url';
import hearts2hearts from '@/app/hearts2hearts-experience.css?url';
import kiiikiii from '@/app/kiiikiii-experience.css?url';
import itzy from '@/app/itzy-experience.css?url';
import lesserafim from '@/app/lesserafim-experience.css?url';
import saymyname from '@/app/saymyname-experience.css?url';
import katseye from '@/app/katseye-experience.css?url';
const styles:Record<string,string>={'bm-experience':bm,'illit-experience':illit,'xg-experience':expanded,'aespa-experience':expanded,'ive-experience':ive,'kiof-experience':kiof,'stayc-experience':stayc,'nmixx-experience':nmixx,'hearts2hearts-experience':hearts2hearts,'kiiikiii-experience':kiiikiii,'itzy-experience':itzy,'lesserafim-experience':lesserafim,'saymyname-experience':saymyname,'katseye-experience':katseye};
export function workExperienceStylesheet(className?:string){return className?styles[className]??candidateExperienceStylesheet(className):undefined;}
