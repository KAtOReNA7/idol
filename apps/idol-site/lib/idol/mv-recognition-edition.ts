import editions from '../../data/mv-recognition-editions.json';
import {createRecognitionSelector, type RecognitionEdition} from './recognition-edition-lookup';

export type {RecognitionEditionPhoto} from './recognition-edition-lookup';

/** The caller supplies the already validated original MV/member binding. */
export const mvRecognitionEdition = createRecognitionSelector(Object.values(editions) as RecognitionEdition[]);
