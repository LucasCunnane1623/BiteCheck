import { inspect } from "node:util";

export const getStatusColor = (inspections) => {
    const oneyearago = new Date();
    oneyearago.setFullYear(oneyearago.getFullYear() - 1);

    const criticalCount = inspections.filter(insp => {
        //fecth the dataes and filter by dates that are greater than 1 year
        const inspdate = new Date(insp.date);
        return inspdate >= oneyearago && insp.isCritical === true;

    }).length;

    if (criticalCount === 0) return 'GREEN';
    if (criticalCount < 3) return 'YELLOW';
    return 'RED';   
}