import type {ReactNode} from 'react';
export type CandidateFact={label:string;value:string;sourceUrl:string;scope:string;checkedDate:string};
export type CandidatePortrait={image:string;stageName:string;sourceUrl:string;credit:string};
export type CandidateContent={
 slug:string;groupId:string;name:string;eyebrow:string;headline:string;intro:string;
 hero:{image:string|null;caption:string;sourceUrl:string|null;scopeLabel?:string};
 portraits:Record<string,CandidatePortrait>;facts:CandidateFact[];gaps:string[];
 // Display evidence only; never generate member records from these fields.
 rosterNote:string;activityNote:string;designNote:string;
};
export type CandidateHeroSlots={title:ReactNode;intro:ReactNode;image:ReactNode;actions:ReactNode;facts:ReactNode};
export type CandidateOverviewSlots={members:ReactNode;works:ReactNode;notes:ReactNode;library:ReactNode};
export type CandidateMemberSlots={portrait:ReactNode;identity:ReactNode;summary:ReactNode;actions:ReactNode};
export type CandidateComposition={
 hero:(slots:CandidateHeroSlots)=>ReactNode;
 overview:(slots:CandidateOverviewSlots)=>ReactNode;
 member:(slots:CandidateMemberSlots)=>ReactNode;
};
