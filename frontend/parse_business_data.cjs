const fs = require('fs');

const csvData = `region,avg_price_per_sqft,growth_5yr_percent,demand_level,infrastructure_score,roi_food_beverage,roi_retail,roi_salon_beauty,roi_gym_fitness,roi_pharmacy,roi_clinic_diagnostics,roi_coaching_education,roi_coworking_office,roi_logistics_warehouse,roi_tourism_hospitality,best_domain,max_roi_percent
Aliganj Sector 47,2939,33,Medium,10,28.1,29.1,13.2,27.1,14.3,19.9,20.2,11.9,20.2,11.1,Retail,29.1
Kursi Road Sector 35,7601,45,High,10,15.9,13.2,12.4,15.9,13.9,21.7,19.7,17.7,21.3,26.2,Tourism & Hospitality,26.2
Gomti Nagar Sector 17,4723,41,Very High,9,24.7,13.8,18.0,14.8,22.0,11.3,22.0,21.1,14.9,23.0,Food & Beverage,24.7
Gomti Nagar Sector 13,3784,43,High,6,18.8,22.3,16.8,29.9,15.5,17.2,18.4,15.9,23.4,13.1,Gym & Fitness,29.9
Indira Nagar Sector 12,8744,76,Low,6,27.3,12.7,23.9,20.7,16.8,12.7,19.1,19.8,24.4,17.7,Food & Beverage,27.3
Sitapur Road Sector 45,11402,64,Low,9,28.6,19.2,12.1,14.0,21.4,20.1,20.4,22.4,23.6,29.5,Tourism & Hospitality,29.5
Hazratganj Sector 46,4077,36,High,10,19.4,27.5,18.6,11.8,27.9,10.8,24.8,22.0,19.1,16.2,Pharmacy,27.9
Kanpur Road Sector 20,8126,68,Very High,9,27.5,19.1,14.6,26.6,22.1,18.2,27.1,12.3,16.7,19.9,Food & Beverage,27.5
Sitapur Road Sector 8,11633,69,Medium,10,22.0,15.2,19.5,16.4,12.1,21.8,16.1,29.5,27.8,29.4,Coworking & Office,29.5
Hazratganj Sector 45,3473,65,Low,6,18.1,25.1,27.1,27.4,12.1,15.1,10.2,22.5,14.4,24.9,Gym & Fitness,27.4
Chinhat Sector 31,11018,78,Very High,9,26.0,16.2,16.9,11.3,25.3,27.6,20.3,22.0,22.6,24.4,Clinic & Diagnostics,27.6
Indira Nagar Sector 38,11718,43,Low,5,28.0,16.0,15.4,15.8,29.1,19.4,23.4,22.8,16.6,17.2,Pharmacy,29.1
Chinhat Sector 7,3784,39,Medium,10,16.9,10.8,19.8,12.9,22.5,10.2,22.0,21.8,14.7,27.6,Tourism & Hospitality,27.6
Faizabad Road Sector 38,7845,26,Low,6,29.6,17.8,20.8,11.4,19.5,14.7,15.4,14.4,28.6,26.8,Food & Beverage,29.6
Kursi Road Sector 27,4558,31,High,6,18.0,24.9,21.0,17.3,13.0,13.5,23.2,14.2,25.5,18.7,Logistics & Warehouse,25.5
Hazratganj Sector 46,11171,58,Low,5,22.2,16.7,10.1,10.2,21.9,13.8,21.6,15.6,27.6,29.2,Tourism & Hospitality,29.2
Chinhat Sector 41,5519,56,High,10,25.4,12.7,13.7,22.9,19.3,17.8,12.1,22.5,16.0,24.2,Food & Beverage,25.4
Sitapur Road Sector 40,9067,72,Very High,10,14.6,14.3,15.1,10.1,27.1,25.5,25.4,14.8,19.5,29.8,Tourism & Hospitality,29.8
Sitapur Road Sector 4,10841,54,Medium,9,29.7,29.6,25.3,11.7,19.5,22.1,16.2,11.7,18.9,23.4,Food & Beverage,29.7
Kanpur Road Sector 27,5609,65,Very High,7,28.3,29.5,21.4,21.7,10.2,11.6,12.4,20.6,16.6,15.9,Retail,29.5
Kursi Road Sector 46,5567,51,Low,9,24.9,21.7,29.6,10.8,28.9,28.9,10.3,12.0,23.7,23.2,Salon & Beauty,29.6
Chinhat Sector 26,6743,67,Very High,7,14.2,24.3,24.1,12.9,23.8,30.0,28.3,14.1,29.2,21.8,Clinic & Diagnostics,30.0
Hazratganj Sector 6,6107,73,Very High,5,22.3,25.5,12.6,14.0,19.6,12.3,10.3,28.8,12.2,26.5,Coworking & Office,28.8
Chinhat Sector 20,6142,68,Very High,5,27.4,15.2,29.0,16.3,17.0,22.0,11.2,16.7,20.1,11.4,Salon & Beauty,29.0
Sitapur Road Sector 43,6019,43,Low,9,14.9,14.7,25.0,25.8,12.4,28.6,14.4,23.6,17.5,20.2,Clinic & Diagnostics,28.6
Chinhat Sector 35,4005,46,High,8,24.7,29.2,13.5,20.6,10.7,25.8,10.6,28.8,11.0,10.7,Retail,29.2
Chinhat Sector 33,8540,80,Very High,10,28.4,21.1,11.5,15.2,13.4,22.4,29.3,16.7,29.3,21.0,Coaching & Education,29.3
Kanpur Road Sector 23,6157,74,Very High,10,24.3,23.7,22.1,19.0,14.2,28.4,16.8,21.7,18.0,25.7,Clinic & Diagnostics,28.4
Aliganj Sector 39,10358,52,Medium,8,25.0,12.4,27.8,12.4,17.1,19.4,22.5,21.1,26.2,12.3,Salon & Beauty,27.8
Chinhat Sector 15,6223,34,High,7,14.1,19.6,18.9,13.8,20.3,11.2,11.8,24.6,20.3,17.9,Coworking & Office,24.6
Gomti Nagar Sector 45,4537,38,Medium,9,18.4,13.4,21.0,12.8,19.0,26.4,25.2,10.4,11.2,14.3,Clinic & Diagnostics,26.4
Sitapur Road Sector 50,3937,29,Medium,10,16.5,26.4,17.9,21.9,22.5,15.5,18.4,21.5,18.5,11.6,Retail,26.4
Kursi Road Sector 39,4691,40,High,6,17.6,13.2,12.1,14.2,25.2,28.7,10.5,17.3,28.2,25.9,Clinic & Diagnostics,28.7
Indira Nagar Sector 48,10769,30,High,10,19.3,15.6,19.4,14.3,29.1,10.3,15.5,11.5,12.0,28.8,Pharmacy,29.1
Hazratganj Sector 27,9021,34,Very High,10,20.1,27.2,13.8,19.1,26.4,26.8,18.9,25.6,25.2,26.8,Retail,27.2
Kursi Road Sector 18,8946,57,High,9,12.8,18.3,16.5,12.8,25.0,24.0,13.2,24.6,14.0,25.6,Tourism & Hospitality,25.6
Kanpur Road Sector 11,6799,25,Very High,5,26.9,15.8,25.5,30.0,23.2,12.6,21.3,15.4,15.9,26.6,Gym & Fitness,30.0
Hazratganj Sector 39,11601,40,Very High,8,21.6,24.5,24.1,28.9,11.4,15.9,17.1,19.5,27.8,16.7,Gym & Fitness,28.9
Gomti Nagar Sector 36,7129,55,Medium,6,27.6,18.2,23.9,18.7,16.9,25.4,16.3,13.0,18.9,28.4,Tourism & Hospitality,28.4
Raebareli Road Sector 39,8451,44,Low,5,22.2,27.3,18.8,18.5,25.2,17.1,14.1,14.1,25.5,11.2,Retail,27.3
Kursi Road Sector 4,9167,80,Low,10,24.8,27.9,12.7,26.7,17.4,17.8,16.0,28.7,12.5,29.0,Tourism & Hospitality,29.0
Raebareli Road Sector 46,9166,58,Very High,10,13.5,16.3,25.0,22.6,19.0,29.3,16.5,24.9,10.6,11.9,Clinic & Diagnostics,29.3
Hazratganj Sector 49,8065,34,Medium,7,17.2,10.2,21.9,18.6,18.9,26.5,25.0,15.0,17.8,15.4,Clinic & Diagnostics,26.5
Chinhat Sector 9,4320,63,Very High,5,24.2,15.6,10.0,19.1,29.9,17.3,13.3,19.1,28.2,24.7,Pharmacy,29.9
Kursi Road Sector 3,5851,48,High,6,16.1,13.8,15.5,18.4,15.3,27.1,14.9,11.1,22.0,17.5,Clinic & Diagnostics,27.1
Indira Nagar Sector 21,9089,64,High,9,11.7,22.0,16.8,13.7,17.9,19.5,15.2,26.6,16.2,23.6,Coworking & Office,26.6
Faizabad Road Sector 44,7907,27,High,8,28.4,25.5,21.5,11.6,29.7,10.2,18.6,10.4,24.7,24.7,Pharmacy,29.7
Kanpur Road Sector 11,11978,34,High,8,28.6,19.5,11.5,23.4,12.5,10.8,12.4,26.2,21.8,10.0,Food & Beverage,28.6
Chinhat Sector 9,6714,44,Medium,10,12.5,29.9,25.7,17.1,26.4,24.7,29.0,14.6,19.5,20.9,Retail,29.9
Aliganj Sector 14,2726,32,Low,8,23.9,10.5,17.7,26.4,20.2,21.1,24.7,16.9,26.5,12.2,Logistics & Warehouse,26.5
Kanpur Road Sector 37,2859,78,High,9,28.5,19.0,23.2,21.7,27.2,23.9,19.1,11.0,14.2,25.1,Food & Beverage,28.5
Indira Nagar Sector 46,6316,39,Very High,9,10.6,28.5,10.7,12.4,12.0,20.8,27.4,13.4,22.8,24.1,Retail,28.5
Hazratganj Sector 15,9988,28,Low,6,22.6,18.9,26.6,23.8,17.0,18.0,26.9,18.3,25.5,15.8,Coaching & Education,26.9
Indira Nagar Sector 11,5906,56,High,5,26.1,10.2,11.0,14.6,23.3,15.2,18.0,20.6,25.0,14.7,Food & Beverage,26.1
Raebareli Road Sector 37,5651,25,Very High,10,21.1,21.2,20.0,15.0,17.0,16.6,26.6,11.7,19.6,24.0,Coaching & Education,26.6
Faizabad Road Sector 46,3029,32,Very High,6,23.9,25.2,12.3,19.4,25.2,18.5,12.8,16.0,19.4,20.6,Retail,25.2
Aliganj Sector 19,2633,77,Very High,7,15.8,28.6,17.4,21.3,10.2,10.9,16.5,20.0,23.4,10.8,Retail,28.6
Faizabad Road Sector 42,5447,46,High,9,15.9,19.2,13.5,21.4,26.2,10.4,26.8,27.6,16.8,29.5,Tourism & Hospitality,29.5
Sitapur Road Sector 24,11196,47,Very High,8,13.7,15.4,24.3,12.6,26.3,26.4,23.6,29.5,16.7,28.3,Coworking & Office,29.5
Sitapur Road Sector 17,6302,37,Low,5,18.0,22.2,23.9,11.8,27.6,14.9,12.4,26.6,25.3,27.1,Pharmacy,27.6
Indira Nagar Sector 24,5154,53,High,6,14.0,22.6,29.5,23.9,25.0,23.0,30.0,13.7,12.9,16.4,Coaching & Education,30.0
Raebareli Road Sector 20,8760,44,Medium,9,24.5,14.6,20.6,17.3,25.5,28.1,10.4,26.7,11.7,26.0,Clinic & Diagnostics,28.1
Raebareli Road Sector 14,9452,57,Very High,10,20.7,24.0,19.6,14.0,25.2,27.8,13.7,22.6,16.9,22.7,Clinic & Diagnostics,27.8
Aliganj Sector 47,10162,45,Medium,5,14.1,27.2,26.1,13.5,28.4,28.2,12.3,20.9,12.7,25.1,Pharmacy,28.4
Kursi Road Sector 27,2838,28,Medium,6,21.4,19.5,17.8,29.2,16.1,27.4,20.6,14.1,28.2,18.8,Gym & Fitness,29.2
Raebareli Road Sector 48,11486,56,Low,8,10.8,18.7,19.2,10.7,12.1,17.6,12.9,18.6,16.2,24.3,Tourism & Hospitality,24.3
Kursi Road Sector 1,8865,30,Very High,5,11.1,12.3,14.6,22.4,24.4,28.5,22.0,24.1,11.0,12.4,Clinic & Diagnostics,28.5
Chinhat Sector 18,5495,63,Very High,8,20.8,24.6,29.7,25.2,21.3,26.5,20.4,13.6,21.2,14.9,Salon & Beauty,29.7
Hazratganj Sector 48,6597,29,Medium,9,26.1,25.9,11.4,28.6,27.9,13.8,29.3,26.4,18.7,10.2,Coaching & Education,29.3
Faizabad Road Sector 1,6982,76,Very High,10,20.7,10.9,29.5,21.4,15.7,25.9,18.7,25.3,20.2,24.8,Salon & Beauty,29.5
Chinhat Sector 46,11961,40,Very High,5,26.4,27.4,25.7,27.9,14.0,10.1,23.3,22.0,11.0,12.5,Gym & Fitness,27.9
Kanpur Road Sector 14,8858,32,High,8,21.3,21.7,11.5,18.0,10.7,22.2,13.1,13.6,21.6,10.3,Clinic & Diagnostics,22.2
Aliganj Sector 19,5243,34,High,7,23.4,10.7,10.8,14.8,23.2,25.5,26.1,15.5,14.9,14.8,Coaching & Education,26.1
Faizabad Road Sector 1,3143,46,Low,8,22.2,17.2,28.8,19.0,18.3,25.0,28.2,16.7,12.1,12.6,Salon & Beauty,28.8
Raebareli Road Sector 50,6318,27,Low,5,14.9,15.4,24.1,11.0,13.1,28.4,13.7,18.8,10.9,13.3,Clinic & Diagnostics,28.4
Kanpur Road Sector 50,11750,25,Low,7,20.2,10.8,27.2,15.7,25.4,14.7,28.0,15.9,23.3,26.4,Coaching & Education,28.0
Gomti Nagar Sector 6,3983,61,Low,9,14.1,14.7,11.4,20.2,26.0,27.6,17.0,17.3,25.8,29.0,Tourism & Hospitality,29.0
Kursi Road Sector 26,5310,39,Medium,5,28.9,26.3,27.8,14.7,11.4,26.7,28.5,10.9,19.5,16.0,Food & Beverage,28.9
Sitapur Road Sector 31,9009,70,Medium,9,16.2,18.8,17.6,10.4,16.7,28.0,13.9,16.5,24.0,23.8,Clinic & Diagnostics,28.0
Sitapur Road Sector 30,11354,65,Low,10,11.4,22.3,26.5,15.6,18.6,22.3,21.6,13.2,17.2,11.8,Salon & Beauty,26.5
Kursi Road Sector 42,9518,66,Low,8,19.9,24.9,17.2,15.9,22.2,16.2,17.4,18.4,15.6,16.1,Retail,24.9
Chinhat Sector 18,5604,48,Very High,8,21.1,14.3,14.2,26.5,22.2,24.2,29.8,18.0,26.7,28.8,Coaching & Education,29.8
Faizabad Road Sector 20,2938,71,Low,9,25.6,14.9,14.1,21.9,25.3,10.3,20.6,12.0,26.2,29.6,Tourism & Hospitality,29.6
Raebareli Road Sector 32,6237,49,High,10,23.9,16.2,17.9,29.0,25.0,22.6,15.2,14.6,29.9,13.7,Logistics & Warehouse,29.9
Sitapur Road Sector 22,4870,61,Low,5,23.5,21.5,16.2,11.3,11.1,17.5,20.6,10.1,19.1,21.9,Food & Beverage,23.5
Sitapur Road Sector 47,5415,44,High,9,16.9,13.3,25.2,16.2,20.3,14.6,28.5,20.2,24.9,23.1,Coaching & Education,28.5
Raebareli Road Sector 21,3369,31,Very High,7,25.2,17.8,12.3,16.6,28.1,27.4,28.3,11.2,22.2,27.9,Coaching & Education,28.3
Chinhat Sector 46,6435,35,Medium,6,17.1,30.0,24.1,27.2,21.0,27.2,21.4,27.2,16.7,24.9,Retail,30.0
Chinhat Sector 47,7676,71,High,10,24.8,28.1,28.1,26.6,10.4,13.0,18.6,19.9,18.5,26.7,Retail,28.1
Hazratganj Sector 31,5866,45,Low,10,21.6,28.7,24.2,10.7,21.7,16.5,12.6,11.4,19.9,18.8,Retail,28.7
Gomti Nagar Sector 17,11051,28,Medium,6,13.5,27.4,19.3,12.6,20.2,29.1,10.3,11.5,26.6,22.8,Clinic & Diagnostics,29.1
Raebareli Road Sector 43,8990,74,Low,5,22.7,27.2,21.2,27.0,20.9,14.6,21.9,13.7,27.0,20.3,Retail,27.2
Aliganj Sector 50,8871,44,Very High,6,24.2,26.0,10.5,15.0,20.3,22.2,25.2,13.1,13.1,10.8,Retail,26.0
Kanpur Road Sector 16,7009,49,Very High,9,11.3,15.1,12.2,16.4,17.1,22.1,20.5,24.2,21.3,10.1,Coworking & Office,24.2
Aliganj Sector 23,11138,62,High,10,10.4,15.0,11.2,26.3,14.7,21.5,20.2,24.2,21.3,22.8,Gym & Fitness,26.3
Kursi Road Sector 40,5346,53,Very High,7,21.0,27.2,23.9,14.6,19.3,12.5,16.1,24.7,14.0,18.0,Retail,27.2
Aliganj Sector 33,2795,63,Low,7,29.6,15.8,28.7,18.5,25.0,22.2,23.1,23.3,20.5,18.1,Food & Beverage,29.6
Gomti Nagar Sector 34,5605,73,High,9,11.4,13.0,11.3,24.7,27.2,27.4,27.2,24.5,21.2,13.4,Clinic & Diagnostics,27.4
Sitapur Road Sector 30,10671,53,Very High,8,26.7,26.9,10.2,16.9,24.1,12.4,25.6,21.8,19.0,27.7,Tourism & Hospitality,27.7
Kursi Road Sector 27,9399,75,High,5,12.6,13.0,17.0,13.2,21.8,14.1,10.5,29.3,12.8,11.4,Coworking & Office,29.3
Raebareli Road Sector 17,4306,40,Very High,7,28.6,14.3,12.9,15.9,24.1,19.3,12.0,17.0,12.8,28.5,Food & Beverage,28.6
Raebareli Road Sector 9,10092,80,Very High,5,23.6,29.4,28.4,17.1,14.1,10.4,11.1,16.3,29.6,11.9,Logistics & Warehouse,29.6
Kursi Road Sector 4,8494,65,Medium,7,19.6,25.1,29.3,26.6,17.8,21.6,21.6,28.5,24.8,12.0,Salon & Beauty,29.3
Hazratganj Sector 25,4390,54,Very High,5,22.2,20.9,19.2,29.3,10.5,24.5,16.9,22.8,12.4,27.1,Gym & Fitness,29.3
Faizabad Road Sector 11,10792,72,Low,8,14.6,10.5,26.9,18.8,15.1,23.5,11.9,29.5,12.1,18.8,Coworking & Office,29.5
Hazratganj Sector 32,3107,46,Medium,9,21.8,20.2,12.6,25.0,13.9,20.6,22.7,11.8,27.1,12.6,Logistics & Warehouse,27.1
Indira Nagar Sector 10,10147,46,Very High,10,21.1,24.7,27.5,17.2,15.4,25.7,28.1,25.0,25.2,13.9,Coaching & Education,28.1
Gomti Nagar Sector 36,8000,77,High,6,26.1,21.2,22.4,10.6,29.0,22.5,20.4,25.4,14.6,17.4,Pharmacy,29.0
Hazratganj Sector 48,2926,68,High,6,22.3,10.6,16.1,27.7,11.7,28.9,23.5,16.2,17.1,20.2,Clinic & Diagnostics,28.9
Faizabad Road Sector 41,11043,68,Low,6,15.3,17.6,16.4,29.2,26.8,29.3,16.7,12.3,11.8,15.3,Clinic & Diagnostics,29.3
Faizabad Road Sector 12,7887,51,Very High,9,27.9,29.5,21.9,14.3,21.5,22.8,23.3,17.1,24.0,22.1,Retail,29.5
Sitapur Road Sector 24,3356,78,Low,6,22.4,23.1,23.6,15.0,18.7,19.4,22.1,23.6,14.6,20.4,Salon & Beauty,23.6
Faizabad Road Sector 12,3374,62,Very High,8,10.2,11.5,26.3,16.0,24.6,12.0,11.5,17.2,17.7,28.9,Tourism & Hospitality,28.9
Hazratganj Sector 4,4905,38,High,8,12.8,28.6,10.9,18.6,14.8,10.0,21.6,26.5,25.8,24.0,Retail,28.6
Faizabad Road Sector 50,7898,79,Very High,6,11.1,21.9,18.5,14.0,19.8,19.5,17.9,12.2,23.5,21.5,Logistics & Warehouse,23.5
Chinhat Sector 32,6081,40,Very High,7,26.2,12.7,14.0,10.7,22.4,15.2,17.6,27.4,17.7,15.6,Coworking & Office,27.4
Kanpur Road Sector 47,11824,68,High,7,10.5,18.8,15.3,26.9,29.9,15.8,11.8,21.5,25.4,16.6,Pharmacy,29.9
Indira Nagar Sector 19,8028,55,Medium,6,17.5,14.1,19.8,13.2,25.0,19.8,25.9,11.6,28.8,12.1,Logistics & Warehouse,28.8
Aliganj Sector 35,10390,58,High,7,18.0,10.0,11.7,24.1,18.7,25.6,17.2,21.1,18.2,29.7,Tourism & Hospitality,29.7
Kanpur Road Sector 8,7507,72,Medium,7,14.5,11.9,26.8,16.1,24.9,16.3,21.9,24.9,20.4,10.1,Salon & Beauty,26.8
Aliganj Sector 17,4289,71,Low,10,29.4,20.9,14.9,15.6,21.0,17.0,26.5,25.9,21.5,24.6,Food & Beverage,29.4
Raebareli Road Sector 19,10959,47,Low,5,19.8,29.7,17.5,21.3,25.0,17.0,19.1,12.4,17.3,26.6,Retail,29.7
Kanpur Road Sector 10,9448,56,Low,6,13.0,16.6,14.2,19.6,10.4,16.2,26.2,14.3,20.7,17.0,Coaching & Education,26.2
Indira Nagar Sector 26,10227,72,Low,8,22.7,16.0,27.3,27.0,28.6,26.0,24.5,25.1,24.4,29.1,Tourism & Hospitality,29.1
Sitapur Road Sector 14,5949,59,High,6,28.2,16.4,27.9,16.7,28.7,10.4,22.9,15.2,23.9,25.7,Pharmacy,28.7
Aliganj Sector 46,4517,32,Low,8,19.2,21.7,18.2,19.2,18.4,25.4,18.3,28.2,22.0,21.2,Coworking & Office,28.2
Sitapur Road Sector 35,3029,77,High,7,29.5,10.4,22.2,29.6,28.8,17.7,19.8,18.7,19.5,22.1,Gym & Fitness,29.6
Chinhat Sector 45,10096,54,High,5,24.0,28.5,11.8,13.8,29.2,11.4,15.2,23.8,27.4,22.8,Pharmacy,29.2
Kursi Road Sector 44,11650,70,High,9,29.8,15.7,21.9,19.5,26.1,26.1,26.0,14.6,15.0,11.0,Food & Beverage,29.8
Faizabad Road Sector 5,3989,62,Medium,9,15.2,22.2,27.8,18.6,16.8,26.9,27.1,28.4,29.2,16.7,Logistics & Warehouse,29.2
Sitapur Road Sector 37,7140,54,Medium,7,11.5,19.2,21.6,23.1,17.1,14.7,11.1,16.1,27.6,11.0,Logistics & Warehouse,27.6
Kursi Road Sector 30,7858,80,Low,8,15.7,26.6,28.6,22.1,21.2,29.2,16.6,13.1,19.6,11.6,Clinic & Diagnostics,29.2
Hazratganj Sector 43,6882,38,High,5,18.9,22.7,14.0,22.9,27.1,13.3,15.9,29.0,30.0,29.2,Logistics & Warehouse,30.0
Sitapur Road Sector 14,8752,74,Medium,5,18.3,27.1,18.3,14.5,25.5,16.9,24.8,17.8,23.6,25.4,Retail,27.1
Indira Nagar Sector 38,5297,53,Low,7,28.9,18.0,23.0,14.2,28.9,14.7,26.8,16.1,16.0,16.7,Food & Beverage,28.9
Faizabad Road Sector 32,3957,35,High,7,14.7,12.2,20.9,15.6,12.4,15.1,15.9,16.4,20.7,17.5,Salon & Beauty,20.9
Kanpur Road Sector 11,6760,46,Medium,7,25.7,18.5,25.4,23.1,26.6,25.1,17.0,29.7,21.3,23.0,Coworking & Office,29.7
Hazratganj Sector 50,10306,61,Low,9,15.7,14.7,18.7,18.0,29.1,20.4,16.0,25.5,22.5,22.6,Pharmacy,29.1
Raebareli Road Sector 47,6400,61,Medium,9,17.0,10.7,17.9,15.5,19.0,16.3,26.0,17.2,26.2,22.6,Logistics & Warehouse,26.2
Kanpur Road Sector 42,3014,37,Very High,7,26.7,12.6,15.7,20.5,16.1,28.8,11.9,22.0,18.0,25.9,Clinic & Diagnostics,28.8
Indira Nagar Sector 47,3210,46,High,9,26.3,18.3,24.1,25.4,22.8,17.9,14.8,24.0,12.6,25.9,Food & Beverage,26.3
Sitapur Road Sector 8,5545,48,Very High,6,22.5,23.8,10.4,20.5,12.8,18.4,16.8,15.6,29.1,13.2,Logistics & Warehouse,29.1
Aliganj Sector 22,8411,46,Very High,6,17.8,24.8,18.7,22.5,19.0,18.5,15.9,27.4,17.2,24.3,Coworking & Office,27.4
Aliganj Sector 20,6895,34,Very High,7,11.2,20.8,27.7,25.0,28.4,14.8,16.2,22.6,17.5,29.0,Tourism & Hospitality,29.0
Sitapur Road Sector 41,11665,69,Low,7,11.2,25.2,25.8,22.1,13.2,21.9,18.8,27.1,16.1,17.1,Coworking & Office,27.1
Faizabad Road Sector 7,6431,75,Medium,10,13.3,26.4,18.6,30.0,20.8,20.0,13.1,13.7,16.6,12.9,Gym & Fitness,30.0
Chinhat Sector 45,8110,35,Low,10,18.8,13.5,17.8,17.8,14.5,12.5,17.3,11.7,22.2,19.4,Logistics & Warehouse,22.2
Sitapur Road Sector 32,2988,41,Very High,7,21.9,21.5,25.9,17.9,14.8,25.6,19.5,18.7,16.0,12.2,Salon & Beauty,25.9
Aliganj Sector 29,10452,60,Very High,5,13.0,14.3,16.3,21.9,16.1,17.1,17.6,15.1,11.9,27.5,Tourism & Hospitality,27.5
Aliganj Sector 21,2582,64,Very High,8,19.9,18.8,24.9,18.4,24.0,19.9,16.4,17.9,17.1,29.9,Tourism & Hospitality,29.9
Sitapur Road Sector 39,8610,34,High,7,17.5,20.4,13.8,12.6,11.0,25.2,24.2,25.4,17.0,14.7,Coworking & Office,25.4
Hazratganj Sector 43,3284,74,Medium,7,24.8,14.5,11.5,12.4,23.0,19.8,27.2,15.8,15.0,22.3,Coaching & Education,27.2
Sitapur Road Sector 7,7269,78,High,8,22.7,21.0,24.0,11.1,11.3,24.7,22.2,27.3,24.7,26.2,Coworking & Office,27.3
Faizabad Road Sector 47,9190,63,Very High,7,13.6,17.7,12.6,22.7,10.6,20.5,17.5,24.1,19.4,23.9,Coworking & Office,24.1
Aliganj Sector 46,6130,60,Very High,9,10.0,25.4,10.8,24.0,16.0,10.1,26.9,20.2,25.3,19.3,Coaching & Education,26.9
Gomti Nagar Sector 10,10692,55,Very High,9,13.6,28.0,14.0,15.4,24.4,20.7,23.9,12.0,15.5,20.7,Retail,28.0
Indira Nagar Sector 46,10664,38,Medium,10,11.9,21.1,11.1,23.7,23.4,16.2,25.6,21.9,29.9,21.2,Logistics & Warehouse,29.9
Hazratganj Sector 34,4887,28,High,8,27.1,27.4,29.6,20.0,16.1,22.0,28.5,15.6,15.6,15.5,Salon & Beauty,29.6
Faizabad Road Sector 34,5636,49,Medium,10,19.7,24.6,11.0,25.4,23.4,24.0,27.0,26.6,18.0,28.7,Tourism & Hospitality,28.7
Kanpur Road Sector 11,3106,75,Medium,10,17.5,18.3,25.4,21.0,25.1,25.9,14.6,16.8,28.2,10.4,Logistics & Warehouse,28.2
Kanpur Road Sector 29,8535,66,Low,7,13.1,29.2,24.1,26.7,15.8,23.0,10.4,20.3,13.2,18.5,Retail,29.2
Kursi Road Sector 48,10293,80,High,9,14.7,14.3,11.6,14.4,15.3,20.5,11.5,25.8,27.6,26.6,Logistics & Warehouse,27.6
Gomti Nagar Sector 44,6888,71,Very High,9,19.1,15.6,11.6,14.0,13.7,22.1,21.5,27.0,11.5,18.5,Coworking & Office,27.0
Raebareli Road Sector 6,11782,35,Very High,8,20.3,21.5,23.8,26.5,16.7,24.7,26.1,10.2,26.0,26.4,Gym & Fitness,26.5
Gomti Nagar Sector 40,9003,40,Medium,6,16.6,29.2,29.6,26.7,22.0,15.1,21.1,15.8,22.8,29.9,Tourism & Hospitality,29.9
Kanpur Road Sector 36,9266,78,Medium,8,15.6,17.5,11.4,14.2,24.8,12.1,27.2,12.8,17.5,16.7,Coaching & Education,27.2
Raebareli Road Sector 50,9520,74,Medium,8,15.4,16.5,27.1,26.5,23.3,11.8,17.9,19.8,25.4,21.7,Salon & Beauty,27.1
Gomti Nagar Sector 8,8445,69,Very High,10,18.9,15.8,20.4,18.1,18.4,21.9,18.8,19.7,19.5,24.0,Tourism & Hospitality,24.0
Kursi Road Sector 37,10778,71,Low,9,26.8,24.1,18.8,11.1,27.9,20.7,22.5,17.6,16.6,10.7,Pharmacy,27.9
Kanpur Road Sector 22,10902,72,Very High,6,16.5,12.7,14.2,21.9,10.1,19.2,23.8,25.8,22.1,10.7,Coworking & Office,25.8
Aliganj Sector 40,3361,37,Medium,10,25.8,19.5,19.9,24.4,22.9,17.1,25.3,27.3,16.5,15.9,Coworking & Office,27.3
Chinhat Sector 12,6666,65,High,8,26.2,23.2,15.1,25.2,18.8,14.2,18.8,27.5,28.7,12.1,Logistics & Warehouse,28.7
Chinhat Sector 36,8626,77,Low,6,28.1,29.6,12.3,19.6,19.3,23.2,17.8,26.7,22.7,13.5,Retail,29.6
Chinhat Sector 40,4002,59,High,9,11.2,23.7,18.8,12.5,22.7,12.7,12.8,25.4,18.4,28.7,Tourism & Hospitality,28.7
Faizabad Road Sector 5,7714,64,Very High,7,19.7,10.8,24.2,25.9,21.2,15.0,24.6,24.5,10.4,18.2,Gym & Fitness,25.9
Hazratganj Sector 1,3649,78,Very High,7,15.3,19.5,16.0,28.4,16.2,24.3,16.1,17.6,15.2,21.1,Gym & Fitness,28.4
Gomti Nagar Sector 27,3250,62,Medium,5,27.4,28.2,26.5,17.6,14.3,25.6,13.9,11.8,18.2,12.3,Retail,28.2
Kursi Road Sector 46,5228,52,High,10,21.4,11.3,15.6,21.1,19.7,19.4,24.9,19.7,29.9,16.1,Logistics & Warehouse,29.9
Sitapur Road Sector 1,7048,53,High,5,27.1,12.5,13.6,11.1,22.9,21.6,20.0,15.7,26.6,14.3,Food & Beverage,27.1
Faizabad Road Sector 33,10556,33,Low,5,11.4,20.6,12.0,22.3,29.7,18.4,28.4,10.5,26.3,12.3,Pharmacy,29.7
Hazratganj Sector 45,8292,66,High,6,28.6,11.7,12.9,24.1,26.6,14.2,19.0,10.5,10.6,11.6,Food & Beverage,28.6
Aliganj Sector 32,3831,46,High,10,18.5,29.7,18.6,10.7,13.6,16.8,13.4,20.6,13.3,20.7,Retail,29.7
Faizabad Road Sector 12,9678,40,High,5,18.3,28.7,25.3,27.0,29.7,17.9,20.6,22.0,11.7,23.0,Pharmacy,29.7
Kursi Road Sector 7,3235,54,Low,7,28.9,15.7,10.9,22.2,23.4,13.1,11.9,16.3,10.6,14.9,Food & Beverage,28.9
Raebareli Road Sector 20,5122,37,Medium,8,16.1,22.1,22.8,11.9,13.9,19.6,20.6,25.7,18.8,13.4,Coworking & Office,25.7
Chinhat Sector 47,9824,45,Low,8,25.2,21.7,23.3,19.1,18.2,15.1,17.8,21.0,19.3,10.8,Food & Beverage,25.2
Kursi Road Sector 3,4303,43,High,9,28.9,24.7,13.7,26.3,18.5,28.7,27.6,26.7,15.2,14.0,Food & Beverage,28.9
Hazratganj Sector 33,8887,55,Low,5,10.9,28.9,12.0,21.3,16.4,17.5,27.5,22.7,12.0,22.1,Retail,28.9
Chinhat Sector 25,8582,80,Medium,7,26.9,27.7,21.3,14.3,19.6,18.1,13.0,27.3,22.7,13.4,Retail,27.7
Gomti Nagar Sector 3,6081,31,Very High,10,23.2,18.6,12.0,24.1,12.7,17.2,20.6,29.7,18.9,12.5,Coworking & Office,29.7
Hazratganj Sector 18,5899,68,Low,7,18.7,20.0,14.0,10.9,25.0,21.8,16.0,10.3,16.1,14.9,Pharmacy,25.0
Gomti Nagar Sector 12,8902,56,Medium,10,19.2,18.2,25.2,22.1,29.7,16.1,12.7,22.0,19.7,17.0,Pharmacy,29.7
Chinhat Sector 47,8527,34,High,10,14.2,19.3,28.9,26.8,26.7,27.7,28.8,15.0,15.1,23.6,Salon & Beauty,28.9
Gomti Nagar Sector 21,8380,38,Medium,6,20.3,13.2,15.9,10.7,15.1,13.9,15.7,10.3,17.2,18.4,Food & Beverage,20.3
Chinhat Sector 17,10703,79,High,9,21.4,18.8,19.8,14.8,28.5,21.3,20.1,19.6,26.5,17.4,Pharmacy,28.5
Sitapur Road Sector 37,4226,48,Low,8,19.5,16.2,24.7,13.1,20.6,10.5,17.5,28.2,16.3,24.7,Coworking & Office,28.2
Kanpur Road Sector 22,5452,73,Low,6,10.1,19.3,23.8,11.2,18.0,22.9,16.4,24.7,17.0,14.3,Coworking & Office,24.7
Aliganj Sector 47,3393,78,High,6,19.7,27.8,22.7,21.1,25.8,26.8,25.7,12.8,22.1,18.5,Retail,27.8
Aliganj Sector 41,9787,40,Low,8,27.2,19.4,10.9,20.2,21.2,14.4,27.3,16.8,24.2,29.0,Tourism & Hospitality,29.0
Kursi Road Sector 16,8159,80,Very High,7,26.9,18.8,28.2,26.1,13.6,20.7,26.3,19.7,24.0,25.2,Salon & Beauty,28.2
Aliganj Sector 33,4262,41,High,8,24.3,18.1,22.1,17.8,27.1,28.1,20.5,12.1,21.2,19.6,Clinic & Diagnostics,28.1
Chinhat Sector 23,5741,60,Very High,7,16.6,20.9,27.5,25.0,22.2,23.6,16.1,10.0,18.4,29.5,Tourism & Hospitality,29.5
Aliganj Sector 30,11553,71,High,10,11.4,29.9,23.3,11.2,27.2,23.5,11.1,29.4,25.0,17.0,Retail,29.9
Gomti Nagar Sector 7,6516,28,High,5,17.0,20.0,19.8,13.5,13.3,25.0,16.1,14.1,19.4,11.7,Clinic & Diagnostics,25.0
Hazratganj Sector 49,3010,71,Very High,6,28.2,28.5,25.1,22.6,19.4,29.8,12.6,25.4,10.1,16.9,Clinic & Diagnostics,29.8
Kursi Road Sector 48,5898,29,Medium,8,12.4,23.7,23.4,14.2,29.9,16.4,22.7,13.3,19.4,24.3,Pharmacy,29.9
Gomti Nagar Sector 10,8324,64,Medium,9,23.9,23.8,29.9,24.5,21.4,11.7,29.8,10.3,13.6,28.4,Salon & Beauty,29.9
Hazratganj Sector 11,7438,45,Very High,9,13.3,12.0,26.8,20.2,17.1,19.7,11.0,15.5,26.6,10.0,Salon & Beauty,26.8
Chinhat Sector 38,6228,28,Very High,8,18.5,22.0,19.7,26.5,27.4,27.4,14.3,15.9,28.9,24.8,Logistics & Warehouse,28.9
Chinhat Sector 43,7871,26,Low,6,20.9,12.8,10.3,21.0,27.5,13.8,28.4,27.7,17.2,17.1,Coaching & Education,28.4
Hazratganj Sector 29,9876,63,Very High,5,19.5,19.2,26.5,16.7,12.0,12.4,19.1,12.2,27.5,27.2,Logistics & Warehouse,27.5
Faizabad Road Sector 32,10494,48,High,7,25.4,30.0,23.2,23.1,14.2,24.6,17.5,23.9,16.1,12.7,Retail,30.0
Indira Nagar Sector 27,4290,42,Very High,6,28.9,17.2,26.5,26.1,24.7,19.0,21.2,10.7,27.4,28.6,Food & Beverage,28.9
Aliganj Sector 3,4980,26,High,6,25.2,14.2,22.5,29.5,26.9,13.3,15.9,13.4,30.0,14.7,Logistics & Warehouse,30.0
Gomti Nagar Sector 29,11552,36,Very High,8,11.6,28.7,16.9,13.8,13.0,19.5,28.7,19.1,24.5,13.3,Retail,28.7
Chinhat Sector 29,2629,55,Very High,5,18.0,26.2,22.3,20.4,17.9,21.4,19.4,10.7,21.8,11.7,Retail,26.2
Faizabad Road Sector 40,7655,77,High,9,22.1,21.9,28.0,12.5,11.5,19.6,17.0,21.0,22.0,25.7,Salon & Beauty,28.0
Sitapur Road Sector 38,10638,57,High,10,26.6,14.1,15.6,20.2,18.8,20.8,29.4,17.7,12.1,24.5,Coaching & Education,29.4
Kanpur Road Sector 24,8596,25,High,7,20.7,13.9,14.3,22.5,27.3,19.6,28.0,23.5,11.1,23.4,Coaching & Education,28.0
Aliganj Sector 7,7434,27,High,7,21.2,10.4,27.9,24.7,13.4,21.7,28.7,25.6,24.9,12.8,Coaching & Education,28.7
Raebareli Road Sector 22,10239,53,Very High,5,22.8,10.4,21.2,19.7,29.5,22.7,14.2,29.3,22.8,11.4,Pharmacy,29.5
Hazratganj Sector 3,5475,53,High,9,19.6,11.9,22.8,21.7,10.3,23.7,17.1,13.8,21.8,11.1,Clinic & Diagnostics,23.7
Indira Nagar Sector 42,11431,69,High,7,10.4,28.5,12.3,18.0,12.8,14.1,10.7,25.7,12.4,16.9,Retail,28.5
Gomti Nagar Sector 36,9386,26,Medium,7,28.6,20.3,23.4,16.1,14.4,16.8,17.0,25.1,16.6,26.0,Food & Beverage,28.6
Chinhat Sector 17,3318,54,Low,7,12.9,10.6,12.8,14.8,12.2,11.0,20.9,20.4,24.9,14.2,Logistics & Warehouse,24.9
Faizabad Road Sector 10,7844,35,Medium,5,19.1,11.3,19.9,12.4,15.6,15.5,23.0,11.9,20.6,13.0,Coaching & Education,23.0
Raebareli Road Sector 28,11980,79,High,9,25.0,22.5,13.5,27.4,18.4,23.9,13.4,18.4,19.2,22.0,Gym & Fitness,27.4
Indira Nagar Sector 29,5729,71,Low,8,14.5,25.9,20.1,20.3,12.6,15.7,27.3,11.7,20.3,27.2,Coaching & Education,27.3
Hazratganj Sector 1,2523,72,Medium,9,25.5,13.6,20.1,17.2,27.9,18.1,22.4,22.7,27.8,26.5,Pharmacy,27.9
Kanpur Road Sector 4,7182,46,Medium,9,10.7,21.7,16.6,26.0,26.6,26.8,12.1,29.1,17.5,23.1,Coworking & Office,29.1
Kanpur Road Sector 37,5112,63,Medium,9,11.1,19.3,28.8,24.7,15.1,25.0,12.5,18.5,21.3,11.1,Salon & Beauty,28.8
Chinhat Sector 5,3282,29,Low,6,13.5,27.3,12.9,22.1,16.0,25.0,12.3,10.2,21.2,11.8,Retail,27.3
Gomti Nagar Sector 42,6691,64,Very High,10,24.4,21.6,27.9,14.5,26.8,13.9,19.1,22.6,15.4,17.7,Salon & Beauty,27.9
Indira Nagar Sector 4,11798,40,Low,10,10.2,20.2,16.5,24.3,16.5,14.8,20.6,28.9,10.0,17.2,Coworking & Office,28.9
Raebareli Road Sector 7,9447,63,Medium,9,11.6,10.9,12.4,27.1,16.1,25.0,11.5,14.5,14.1,28.5,Tourism & Hospitality,28.5
Raebareli Road Sector 26,7330,43,High,9,11.1,20.2,20.1,15.0,18.0,16.0,19.4,12.3,14.4,19.8,Retail,20.2
Chinhat Sector 35,10013,41,Very High,5,21.5,17.8,23.8,19.0,14.9,17.8,12.4,15.4,24.7,29.4,Tourism & Hospitality,29.4
Gomti Nagar Sector 30,7044,73,Medium,6,10.4,24.8,16.6,19.6,11.7,23.9,17.8,10.5,24.9,19.8,Logistics & Warehouse,24.9
Raebareli Road Sector 6,2911,66,Very High,9,26.2,25.3,18.5,25.5,26.0,26.7,16.3,21.9,23.1,24.1,Clinic & Diagnostics,26.7
Faizabad Road Sector 12,10703,36,Low,7,10.2,26.5,23.6,17.4,24.0,17.8,17.6,13.2,29.3,16.0,Logistics & Warehouse,29.3
Chinhat Sector 28,4986,79,High,10,19.1,12.8,28.8,26.4,20.5,23.3,10.5,13.0,28.1,26.1,Salon & Beauty,28.8
Raebareli Road Sector 27,6008,73,Low,5,14.5,24.0,10.6,11.6,10.6,15.0,18.6,12.1,29.1,28.6,Logistics & Warehouse,29.1
Kursi Road Sector 48,4277,26,High,5,28.4,25.1,20.3,21.5,10.6,10.8,14.0,14.0,11.1,13.3,Food & Beverage,28.4
Kanpur Road Sector 45,9778,58,High,6,21.9,11.9,25.3,11.3,28.8,17.7,12.3,20.7,30.0,14.5,Logistics & Warehouse,30.0
Kursi Road Sector 48,8670,32,Medium,6,17.5,15.3,26.7,18.6,21.3,21.4,23.8,23.2,28.5,12.4,Logistics & Warehouse,28.5
Indira Nagar Sector 18,10133,58,Medium,9,29.7,16.0,14.8,19.9,11.1,15.0,17.0,25.3,29.1,14.4,Food & Beverage,29.7
Indira Nagar Sector 22,3183,79,Very High,6,21.5,18.7,27.7,23.7,27.6,12.7,23.4,26.6,21.2,13.5,Salon & Beauty,27.7
Hazratganj Sector 19,3773,34,Medium,10,29.9,15.7,18.1,29.5,18.2,13.4,27.8,11.3,27.4,15.7,Food & Beverage,29.9
Hazratganj Sector 46,10694,42,Medium,8,10.1,15.9,18.6,25.9,26.4,12.7,27.7,21.1,16.1,20.5,Coaching & Education,27.7
Gomti Nagar Sector 50,11915,37,Low,5,26.7,27.4,26.2,23.6,10.2,11.2,27.9,27.2,10.3,21.8,Coaching & Education,27.9
Kanpur Road Sector 43,11056,50,Very High,7,16.4,15.0,29.1,11.7,29.4,27.5,25.0,14.5,29.9,10.5,Logistics & Warehouse,29.9
Aliganj Sector 11,7184,36,Medium,10,28.9,29.1,12.6,16.0,26.1,27.9,12.1,20.2,18.7,22.5,Retail,29.1
Sitapur Road Sector 24,10411,68,High,9,14.4,10.7,21.9,17.6,22.3,28.7,22.7,14.5,16.9,26.8,Clinic & Diagnostics,28.7
Kursi Road Sector 5,8280,58,Low,8,23.4,27.4,20.3,19.8,20.5,21.3,11.9,27.7,23.4,24.8,Coworking & Office,27.7
Indira Nagar Sector 40,6076,30,Very High,5,12.9,13.6,19.8,19.7,27.0,29.6,14.1,26.2,24.4,11.5,Clinic & Diagnostics,29.6
Hazratganj Sector 44,3399,53,Low,7,17.3,15.5,25.4,25.2,17.9,24.8,22.4,19.5,18.7,21.2,Salon & Beauty,25.4
Kursi Road Sector 27,10848,75,Low,10,25.0,19.8,12.4,25.4,20.6,17.4,26.9,28.5,20.3,21.2,Coworking & Office,28.5
Aliganj Sector 12,3786,45,Low,5,28.6,27.5,27.6,28.3,20.8,11.7,15.9,28.0,29.1,12.7,Logistics & Warehouse,29.1
Gomti Nagar Sector 11,10751,48,Medium,10,19.7,15.7,22.0,22.9,24.1,29.8,27.4,27.3,17.5,12.1,Clinic & Diagnostics,29.8
Kursi Road Sector 7,4609,42,Low,6,15.4,26.4,11.7,27.5,24.3,11.5,25.6,29.9,29.8,20.0,Coworking & Office,29.9
Indira Nagar Sector 45,7956,67,Low,6,23.3,22.8,15.7,22.9,22.4,15.4,22.4,21.6,26.8,23.0,Logistics & Warehouse,26.8
Indira Nagar Sector 19,9776,51,Medium,9,18.7,26.0,26.9,28.1,29.3,12.5,20.5,27.8,21.9,13.5,Pharmacy,29.3
Indira Nagar Sector 17,7961,34,Medium,9,29.0,17.5,26.9,11.6,16.5,25.8,25.5,14.7,20.9,27.2,Food & Beverage,29.0
Hazratganj Sector 19,7506,32,Medium,7,12.2,17.5,25.2,19.2,20.4,25.2,29.9,15.3,12.7,10.8,Coaching & Education,29.9
Raebareli Road Sector 21,7188,54,Low,6,18.2,25.2,16.1,28.8,21.4,11.9,29.3,23.9,23.4,25.3,Coaching & Education,29.3
Sitapur Road Sector 41,11835,80,High,9,17.1,25.9,18.3,18.3,14.5,17.5,16.9,14.4,17.1,29.3,Tourism & Hospitality,29.3
Gomti Nagar Sector 9,7795,25,Low,8,15.5,24.5,10.1,21.0,24.4,22.7,21.5,12.2,15.9,17.1,Retail,24.5
Kanpur Road Sector 38,8820,64,Medium,6,27.2,14.9,16.4,12.1,16.9,14.0,23.3,15.3,15.5,26.9,Food & Beverage,27.2
Indira Nagar Sector 22,9892,52,Medium,5,23.5,19.3,22.0,28.6,16.5,11.6,21.6,17.2,12.2,21.2,Gym & Fitness,28.6
Faizabad Road Sector 47,2645,70,High,10,19.5,17.1,27.1,28.8,22.1,29.6,20.0,22.3,29.8,25.9,Logistics & Warehouse,29.8
Raebareli Road Sector 48,2870,71,Very High,8,11.9,27.9,15.1,23.7,12.9,23.4,12.5,24.1,13.2,19.1,Retail,27.9
Hazratganj Sector 28,4404,55,Medium,8,22.2,10.3,28.7,14.4,12.4,25.5,15.0,23.2,16.1,30.0,Tourism & Hospitality,30.0
Chinhat Sector 18,11748,48,Very High,6,24.3,20.8,12.5,13.0,12.3,13.4,12.0,16.7,22.4,10.4,Food & Beverage,24.3
Raebareli Road Sector 30,7957,59,Very High,8,29.2,15.9,14.6,26.5,28.0,18.1,26.2,16.8,20.0,23.2,Food & Beverage,29.2
Hazratganj Sector 39,11930,76,Very High,6,24.4,16.2,23.9,27.6,23.3,28.0,25.7,11.1,28.7,21.3,Logistics & Warehouse,28.7
Kursi Road Sector 24,11872,46,High,9,21.4,15.8,16.9,26.0,12.7,23.0,19.4,25.1,24.5,16.1,Gym & Fitness,26.0
Raebareli Road Sector 1,5293,51,Medium,6,11.3,16.3,13.8,20.1,20.0,18.0,26.5,20.1,14.8,22.8,Coaching & Education,26.5
Faizabad Road Sector 28,6796,29,High,5,17.1,27.2,16.9,21.4,25.8,25.3,26.2,20.0,22.1,22.2,Retail,27.2
Faizabad Road Sector 33,4678,65,High,6,20.1,14.4,25.4,16.6,11.4,16.5,15.4,23.0,17.3,19.9,Salon & Beauty,25.4
Chinhat Sector 43,11854,73,Medium,9,29.7,17.1,28.8,24.9,12.3,25.5,24.6,21.3,11.1,22.6,Food & Beverage,29.7
Aliganj Sector 11,8038,63,Medium,7,10.5,16.4,19.2,19.6,25.6,25.1,17.2,11.5,23.0,20.1,Pharmacy,25.6
Hazratganj Sector 35,3319,57,Low,6,28.6,10.5,22.2,22.9,14.9,13.6,17.6,27.1,27.4,21.6,Food & Beverage,28.6
Raebareli Road Sector 20,5840,64,Low,7,29.7,18.1,12.3,19.2,14.6,12.7,12.9,29.9,26.3,22.5,Coworking & Office,29.9
Faizabad Road Sector 34,4137,53,Medium,7,28.2,15.4,18.8,24.4,18.1,18.1,17.5,14.6,23.2,20.0,Food & Beverage,28.2
Gomti Nagar Sector 31,5666,52,High,7,26.4,13.2,21.5,22.1,12.1,21.3,29.0,26.3,19.3,20.7,Coaching & Education,29.0
Sitapur Road Sector 28,4577,61,Low,6,28.4,22.0,19.1,19.7,11.4,12.6,15.3,10.7,24.4,18.6,Food & Beverage,28.4
Sitapur Road Sector 32,8583,59,Low,10,19.2,28.3,14.3,25.6,13.0,16.6,16.3,20.8,13.3,20.6,Retail,28.3
Kursi Road Sector 46,3496,60,Low,9,28.4,10.3,21.7,16.2,26.8,20.9,21.6,21.8,10.5,29.5,Tourism & Hospitality,29.5
Indira Nagar Sector 10,7011,29,Low,9,29.9,21.3,23.5,26.5,16.2,10.7,21.5,29.3,23.0,27.8,Food & Beverage,29.9
Raebareli Road Sector 12,5294,36,Low,8,21.1,15.3,20.4,13.3,14.1,20.8,10.2,13.4,16.3,23.6,Tourism & Hospitality,23.6
Sitapur Road Sector 24,10107,67,Very High,6,13.3,27.8,15.0,25.6,25.7,18.1,25.2,20.8,14.0,18.5,Retail,27.8
Sitapur Road Sector 49,4985,77,Low,9,21.8,27.7,29.6,24.0,17.3,26.5,24.8,10.7,11.2,14.8,Salon & Beauty,29.6
Faizabad Road Sector 37,6641,80,Very High,8,26.9,29.2,28.7,15.7,11.1,21.1,16.3,10.4,21.3,26.8,Retail,29.2
Chinhat Sector 49,6068,29,Very High,5,26.8,22.6,20.1,16.1,10.1,14.6,28.1,10.9,18.8,19.9,Coaching & Education,28.1
Hazratganj Sector 17,2732,39,High,6,12.6,24.6,22.8,15.6,17.6,11.8,20.1,21.1,14.0,18.7,Retail,24.6
Sitapur Road Sector 46,2611,47,Very High,5,11.6,28.8,14.3,29.1,15.0,22.5,19.9,15.6,12.8,28.6,Gym & Fitness,29.1
Kanpur Road Sector 45,5801,26,High,8,22.0,29.6,21.7,10.1,12.6,29.2,22.4,15.9,23.7,19.0,Retail,29.6
Kanpur Road Sector 17,10216,43,Low,8,23.9,17.0,15.5,18.7,22.7,19.8,28.2,24.0,12.9,28.6,Tourism & Hospitality,28.6
Raebareli Road Sector 49,8606,30,Low,7,11.3,25.8,24.4,14.6,12.8,28.4,11.5,25.2,25.5,25.2,Clinic & Diagnostics,28.4
Hazratganj Sector 43,9383,55,Low,7,12.1,10.2,12.5,12.0,11.5,15.9,12.4,26.0,13.1,18.4,Coworking & Office,26.0
`;

const lines = csvData.trim().split('\n');
const headers = lines[0].split(',');
const json = lines.slice(1).map((line, i) => {
  const values = line.split(',');
  const obj = { id: i + 1 };
  
  headers.forEach((header, index) => {
    let val = values[index];
    if (val && !isNaN(val)) {
      obj[header] = parseFloat(val);
    } else {
      obj[header] = val;
    }
  });

  // Mock lat lng centered around Lucknow [26.8467, 80.9462]
  obj.lat = 26.8467 + (Math.random() - 0.5) * 0.15;
  obj.lng = 80.9462 + (Math.random() - 0.5) * 0.15;

  return obj;
});

const content = 'export const mockBusinessData = ' + JSON.stringify(json, null, 2) + ';';
fs.writeFileSync('src/data/lucknowBusinessROI.ts', content);
