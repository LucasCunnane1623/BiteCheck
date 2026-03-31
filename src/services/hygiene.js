/**
 * Determines the overall health status of a restaurant based on its recent inspection history.
 * The function evaluates the most recent inspections, giving more weight to critical violations and recent scores.
 * Uses a weighted approach: Grade + Score + Critical Trend
 * - RED: High critical violations or poor recent score (e.g., 3+ criticals in last 3 inspections, or a recent score > 20)
 * - YELLOW: Moderate issues (e.g., a "B" grade, or 1-2 criticals in last 3 inspections, or a recent score between 14-20)
 * - GREEN: Good standing (e.g., an "A" grade with no criticals in the last 3 inspections and a recent score <= 13)
 * @param {Array} inspections - List of inspection objects for the restaurant, each containing at least 'date', 'grade', 'score', and 'isCritical' properties.
 * @returns {string} Overall status color: "RED", "YELLOW", or "GREEN".
 * @example
 * const inspections = [
 *   { date: "2024-05-01", grade: "A", score: 10, isCritical: false },
 *   { date: "2024-02-15", grade: "B", score: 18, isCritical: true },
 *   { date: "2023-12-10", grade: "C", score: 25, isCritical: true },
 *   { date: "2023-08-20", grade: "A", score: 8, isCritical: false }
 * ];
 * const status = getStatusColor(inspections); // Returns "RED" due to recent critical violations and poor score
 */
export const getStatusColor = (inspections) => {
    if (!inspections || !Array.isArray(inspections) || inspections.length === 0) {
        return "GREEN"; // Default to green if no inspections are available
    }
    // sort by date, most recent first
    const sorted = [...inspections].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // most recent sorted[0]
    const mostRecent = sorted[0];

    // check the 3 most recent inspections first.
    const lastThree = sorted.slice(0, 3);

    // if the most recent inspection is critical, return red immediately.
    if (mostRecent.grade === 'C') return 'RED';

    // count the critical violations made.
    const CriticalCount = lastThree.filter(i=> i.isCritical === true).length;

    // RED: high critical violations or poor recent score
    if (CriticalCount >= 3 || mostRecent.score > 20) return 'RED';

    // Yellow: "B" grade , or starting to show critical issues.
    if (mostRecent.grade === "B" || CriticalCount > 0 || (mostRecent.score > 13 && mostRecent.score <= 20)) return 'YELLOW';

    // GREEN: "A" must have an A grade and a clean recent history
    if (mostRecent.grade === "A" && CriticalCount === 0) return 'GREEN';

    return "GREEN"; // default to green if none of the above conditions are met
}








