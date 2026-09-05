export function normalizeWorksheetGroup(value={}) { return { id:Number(value.id)||0, description:String(value.description||'').trim(), details:String(value.details||''), annulled:Boolean(value.annulled), grouphtitems:normalizeWorksheetItems(value.grouphtitems) } }
export function normalizeWorksheetGroups(values){ return Array.isArray(values)?values.map(normalizeWorksheetGroup):[] }
export function normalizeWorksheetItem(value={}){ return { id:Number(value.id)||0, groupHtId:Number(value.groupHtId)||0, examId:Number(value.examId)||0, description:String(value.description||'').trim() } }
export function normalizeWorksheetItems(values){ return Array.isArray(values)?values.map(normalizeWorksheetItem):[] }
