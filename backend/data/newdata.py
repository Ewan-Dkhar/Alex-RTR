
import pandas as pd
import numpy as np
import random

# Load the files to be merged
df_buy = pd.read_csv("lucknow_buy_rates.csv")
df_land = pd.read_csv("lucknow_expanded_land.csv")
df_rent = pd.read_csv("lucknow_expanded_rent.csv")
df_rent_rates = pd.read_csv("lucknow_rent_rates.csv")
df_roi = pd.read_csv("lucknow_roi_growth.csv")

# Standardize location column
df_land.rename(columns={'region': 'location'}, inplace=True)
df_rent.rename(columns={'region': 'location'}, inplace=True)

# Merge them on location using outer join
merged = df_buy.merge(df_land, on='location', how='outer', suffixes=('', '_land'))
merged = merged.merge(df_rent, on='location', how='outer', suffixes=('', '_rent'))
merged = merged.merge(df_rent_rates, on='location', how='outer', suffixes=('', '_rentrates'))
merged = merged.merge(df_roi, on='location', how='outer', suffixes=('', '_roi'))

# Clean up duplicate/overlapping columns 
# (For simplicity, we'll keep the first non-null value for overlapping columns if we wanted to be rigorous, 
# but let's just forward fill similar concepts or keep them as distinct features)

print(f"Base merged rows: {len(merged)}")
print(f"Columns: {merged.columns.tolist()}")

# Create synthetic data to reach 5000 rows
# We will create specific property entries or sub-locality reports based on the base location traits

property_types = ['Residential Plot', 'Commercial Plot', '1BHK Apartment', '2BHK Apartment', '3BHK Apartment', 'Independent House', 'Retail Shop', 'Warehouse space']
phases = [f"Phase {i}" for i in range(1, 6)] + [f"Sector {chr(i)}" for i in range(65, 75)] + ["Extension", "Main Road", "Inner Circle"]

synthetic_data = []

base_records = merged.to_dict('records')

# Generate 5000 records
for i in range(5000):
    base = random.choice(base_records)
    loc = base.get('location', 'Unknown')
    if pd.isna(loc): continue
    
    sub_area = f"{loc} - {random.choice(phases)}"
    prop_type = random.choice(property_types)
    
    # Extract base stats with some noise
    try:
        base_buy_sqft = str(base.get('avg_price_per_sqft', '2000')).split('-')[0]
        base_buy_sqft = float(base_buy_sqft) if pd.notna(base_buy_sqft) and str(base_buy_sqft).replace('.','',1).isdigit() else 3000
    except:
        base_buy_sqft = 3000
        
    perturbed_buy_price = int(base_buy_sqft * random.uniform(0.8, 1.3))
    
    # We will build a unified, rich record
    record = {
        'id': f"LKO-PROP-{10000 + i}",
        'location': loc,
        'sub_locality': sub_area,
        'property_type': prop_type,
        'estimated_price_per_sqft': perturbed_buy_price,
        'demand_level': base.get('demand_level', 'Medium') if pd.notna(base.get('demand_level')) else 'Medium',
        'roi_category': base.get('roi_category', 'Medium') if pd.notna(base.get('roi_category')) else 'Medium',
        'infrastructure_score': base.get('infrastructure_score', 6) if pd.notna(base.get('infrastructure_score')) else 6,
        'zone_type': base.get('zone_type', 'Residential') if pd.notna(base.get('zone_type')) else 'Residential',
        'growth_potential': base.get('growth_potential', 'Medium') if pd.notna(base.get('growth_potential')) else 'Medium',
        'best_for': base.get('best_for', 'Mixed Use') if pd.notna(base.get('best_for')) else 'Mixed Use',
        'remarks': base.get('remarks', '') if pd.notna(base.get('remarks')) else ''
    }
    synthetic_data.append(record)

expanded_df = pd.DataFrame(synthetic_data)
expanded_df.to_csv("lucknow_data.csv", index=False)

print(f"Generated lucknow_data.csv with {len(expanded_df)} rows.")


