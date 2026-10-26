import type {CatalogView} from '../../types';
export function catalogBelongs(catalog:unknown):boolean;
export function createVchaReview(options:{host:HTMLElement;catalog:CatalogView;production:object;onStatus?:(message:string)=>void;validationWidth?:320|390|1440}):{ready:Promise<unknown>;destroy:()=>void};
