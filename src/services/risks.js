const risk_map = {
    '04L': {illness: 'Leptospirosis, Salmonella(Mice)', vector: "Mice", severity: 'high'},
    '04M': {illness: 'Salmonella, E. Coli (roaches)', vector: "Roaches", severity: 'medium'},
    '04N' : {illness: 'Various pathogens', vector: "Flies", severity: 'medium'},
    '02G' : {illness: 'Bacillus cereus, Clostridium perfringens (Imporper cooling)', vector: "Improper cooling", severity: 'high'},
    '02B' : {illness: 'Salmonella, Campylobacter', cause: 'undercooked poultry/meat', severity: 'high'},
    '06C' : {illness: 'Norovirus, Hepatitis A (Contaminated food)', vector: "Contaminated food", severity: 'high'},
    '08A' : {illness: 'Hantavirus (pest infestation)', vector: "Pest infestation", severity: 'high'},
    '05D': { illness: 'Shigella, Norovirus', cause: 'Sewage/Plumbing Issues', severity: 'Critical' }
}

export const get_illness_risk = (violationCode) => {
    return risk_map[violationCode] || {illness:'general foodborne illness risk', cause: 'Standard sanitary violation', severity: 'Low'};
    
}
