import type {Candidate} from './candidates';

export function architectureOf(candidate:Candidate){return candidate.architecture.split(' · ')[0];}
export function yearRange(catalog:Candidate[]){const years=catalog.map(c=>c.year);return years.length?{first:Math.min(...years),last:Math.max(...years)}:{first:1998,last:2025};}
export function hasCurrentCatalog(value:unknown,required:Candidate[]):value is Candidate[]{return Array.isArray(value)&&value.length>=required.length&&required.every(c=>value.some(item=>item?.id===c.id));}
export const spotlightIds=['voodoo2','geforce-256','radeon-9700-pro','8800-gtx','gtx-1060','gtx-1080-ti','arc-b580','rx-9070-xt','rtx-5090'];
export function highlightCandidates(catalog:Candidate[]){return spotlightIds.map(id=>catalog.find(c=>c.id===id)).filter((c):c is Candidate=>!!c);}
export type CatalogFilters={search:string;manufacturer:string;period:string;decade:string;architecture:string;favoritesOnly:boolean};
export function filterCandidates(catalog:Candidate[],filters:CatalogFilters,favorites:string[]){
 const search=filters.search.trim().toLocaleLowerCase('pt-BR');
 return catalog.filter(c=>(filters.manufacturer==='Todas'||c.manufacturer===filters.manufacturer)
  &&(filters.period==='Todas'||c.era===filters.period)
  &&(filters.decade==='Todas'||String(Math.floor(c.year/10)*10)===filters.decade)
  &&(filters.architecture==='Todas'||architectureOf(c)===filters.architecture)
  &&(!filters.favoritesOnly||favorites.includes(c.id))
  &&(c.name.toLocaleLowerCase('pt-BR').includes(search)||c.number.includes(search)));
}
