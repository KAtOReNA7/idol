// Synthetic design projection: identity and image sources belong to this fixture only.
import {fixtureMemberId} from '../synthetic-catalog';
export default {
 heroImage:'/image-fixture/hero.png?host=hearts2hearts',
 members:(['A','B'] as const).map(suffix=>({id:fixtureMemberId(45,suffix),cn:`FIXTURE_${suffix}`})),
 releaseImages:{'iconic-heart':'/image-fixture/release.png?host=hearts2hearts'},
};
