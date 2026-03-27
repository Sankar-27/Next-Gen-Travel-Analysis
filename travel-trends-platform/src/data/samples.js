// ============ SAMPLE DATASETS ============

window.SAMPLE_DATASETS = {

  searchTrends: {
    name: "Global Travel Search Trends 2023-2024",
    csvText: `destination,country,region,search_volume,month,year,avg_stay_days,travel_type,climate_type,search_growth_pct
Iceland,Iceland,Europe,142000,Jan,2023,8,Coolcation,Subarctic,22
Iceland,Iceland,Europe,165000,Apr,2023,9,Coolcation,Subarctic,35
Iceland,Iceland,Europe,188000,Jul,2023,10,Coolcation,Subarctic,48
Iceland,Iceland,Europe,175000,Oct,2023,9,Coolcation,Subarctic,41
Scotland,UK,Europe,98000,Jan,2023,7,Coolcation,Temperate,18
Scotland,UK,Europe,115000,Apr,2023,8,Coolcation,Temperate,28
Scotland,UK,Europe,134000,Jul,2023,9,Coolcation,Temperate,39
Scotland,UK,Europe,121000,Oct,2023,8,Coolcation,Temperate,32
New Zealand,New Zealand,Oceania,87000,Jan,2023,14,Slow Travel,Temperate,15
New Zealand,New Zealand,Oceania,105000,Apr,2023,16,Slow Travel,Temperate,25
New Zealand,New Zealand,Oceania,122000,Jul,2023,18,Slow Travel,Temperate,36
New Zealand,New Zealand,Oceania,118000,Oct,2023,17,Slow Travel,Temperate,38
Tuscany,Italy,Europe,195000,Jan,2023,10,Agritourism,Mediterranean,12
Tuscany,Italy,Europe,245000,Apr,2023,12,Agritourism,Mediterranean,28
Tuscany,Italy,Europe,312000,Jul,2023,14,Agritourism,Mediterranean,42
Tuscany,Italy,Europe,278000,Oct,2023,13,Agritourism,Mediterranean,35
Dubrovnik,Croatia,Europe,74000,Jan,2023,6,Set-Jetting,Mediterranean,45
Dubrovnik,Croatia,Europe,142000,Apr,2023,7,Set-Jetting,Mediterranean,78
Dubrovnik,Croatia,Europe,198000,Jul,2023,7,Set-Jetting,Mediterranean,112
Dubrovnik,Croatia,Europe,166000,Oct,2023,6,Set-Jetting,Mediterranean,95
Bali,Indonesia,Asia,265000,Jan,2023,12,Wellness,Tropical,18
Bali,Indonesia,Asia,298000,Apr,2023,13,Wellness,Tropical,24
Bali,Indonesia,Asia,342000,Jul,2023,14,Wellness,Tropical,32
Bali,Indonesia,Asia,318000,Oct,2023,13,Wellness,Tropical,28
Kyoto,Japan,Asia,185000,Jan,2023,8,Slow Travel,Temperate,22
Kyoto,Japan,Asia,225000,Apr,2023,10,Slow Travel,Temperate,38
Kyoto,Japan,Asia,268000,Jul,2023,11,Slow Travel,Temperate,52
Kyoto,Japan,Asia,245000,Oct,2023,10,Slow Travel,Temperate,44
Costa Rica,Costa Rica,Americas,112000,Jan,2023,11,Wellness,Tropical,28
Costa Rica,Costa Rica,Americas,134000,Apr,2023,12,Wellness,Tropical,36
Costa Rica,Costa Rica,Americas,156000,Jul,2023,13,Wellness,Tropical,42
Costa Rica,Costa Rica,Americas,148000,Oct,2023,12,Wellness,Tropical,40
Queenstown,New Zealand,Oceania,68000,Jan,2023,9,Multi-Generational,Temperate,31
Queenstown,New Zealand,Oceania,88000,Apr,2023,10,Multi-Generational,Temperate,45
Queenstown,New Zealand,Oceania,102000,Jul,2023,11,Multi-Generational,Temperate,56
Queenstown,New Zealand,Oceania,94000,Oct,2023,10,Multi-Generational,Temperate,50
Norway,Norway,Europe,95000,Jan,2024,9,Coolcation,Subarctic,55
Norway,Norway,Europe,118000,Apr,2024,10,Coolcation,Subarctic,68
Norway,Norway,Europe,145000,Jul,2024,11,Coolcation,Subarctic,82
Iceland,Iceland,Europe,198000,Jan,2024,10,Coolcation,Subarctic,63
Tuscany,Italy,Europe,325000,Apr,2024,15,Agritourism,Mediterranean,62
Bali,Indonesia,Asia,378000,Jul,2024,15,Wellness,Tropical,48
Dubrovnik,Croatia,Europe,225000,Jul,2024,8,Set-Jetting,Mediterranean,130
Kyoto,Japan,Asia,298000,Jul,2024,12,Slow Travel,Temperate,68`
  },

  climateDestination: {
    name: "Climate & Destination Tourism Index 2024",
    csvText: `destination,country,region,avg_temp_celsius,annual_tourists_millions,year_over_year_growth,avg_booking_lead_days,wellness_score,coolness_index,film_productions,agri_score
Reykjavik,Iceland,Europe,5,2.3,18.5,62,72,95,8,35
Bergen,Norway,Europe,8,1.8,22.1,58,68,92,5,42
Inverness,Scotland,Europe,9,1.2,28.4,45,65,88,12,55
Queenstown,New Zealand,Oceania,12,1.5,19.2,55,78,82,18,68
Ubud,Indonesia,Asia,27,3.2,15.6,38,94,45,22,72
Chiang Mai,Thailand,Asia,28,2.8,12.3,42,88,42,14,65
Cusco,Peru,Americas,14,1.9,24.7,50,82,76,6,80
Oaxaca,Mexico,Americas,22,1.4,32.8,35,75,55,8,88
Tuscany Region,Italy,Europe,18,4.8,18.9,48,80,60,16,92
Provence,France,Europe,16,3.6,14.2,52,82,58,20,88
Alentejo,Portugal,Europe,19,1.1,38.5,42,76,62,4,90
Azores,Portugal,Europe,18,0.9,45.2,50,85,78,3,72
Hokkaido,Japan,Asia,8,2.4,28.6,60,72,86,10,78
Faroe Islands,Denmark,Europe,10,0.4,52.3,72,70,95,6,30
Madeira,Portugal,Europe,20,1.7,22.4,48,88,72,8,65
Bhutan,Bhutan,Asia,15,0.3,36.8,90,95,80,2,85
Patagonia,Argentina,Americas,8,0.8,42.1,65,80,94,5,40
Kerala,India,Asia,29,3.4,18.7,38,92,48,12,82
Slovenia,Slovenia,Europe,11,1.3,48.2,55,88,82,6,72
Georgian Wine Region,Georgia,Asia,16,1.2,55.6,45,70,65,4,95`
  },

  bookingData: {
    name: "Travel Booking Trends & Behavior 2023-2024",
    csvText: `booking_id,destination,country,region,travel_type,month,year,party_size,avg_age,stay_duration_days,total_spend_usd,accommodation_type,booking_lead_days,repeat_visitor
B001,Iceland,Iceland,Europe,Coolcation,Jan,2023,2,34,9,3800,Boutique Hotel,72,No
B002,Bali,Indonesia,Asia,Wellness,Mar,2023,1,31,14,2600,Wellness Resort,45,Yes
B003,Tuscany,Italy,Europe,Agritourism,May,2023,4,48,12,6200,Agriturismo,60,No
B004,Dubrovnik,Croatia,Europe,Set-Jetting,Jun,2023,2,28,7,2900,Apartment,30,No
B005,New Zealand,New Zealand,Oceania,Slow Travel,Jul,2023,3,42,21,8500,Mix,90,Yes
B006,Kyoto,Japan,Asia,Slow Travel,Apr,2023,2,36,10,4200,Ryokan,55,No
B007,Costa Rica,Costa Rica,Americas,Wellness,Feb,2023,2,39,13,3900,Eco Lodge,50,No
B008,Norway,Norway,Europe,Coolcation,Aug,2023,4,55,10,7800,Cabin,80,Yes
B009,Oaxaca,Mexico,Americas,Agritourism,Nov,2023,5,52,9,3400,Hacienda,40,No
B010,Queenstown,New Zealand,Oceania,Multi-Generational,Dec,2023,6,44,12,12000,Villa,65,Yes
B011,Iceland,Iceland,Europe,Coolcation,Feb,2023,2,33,8,3600,Boutique Hotel,68,No
B012,Bali,Indonesia,Asia,Wellness,Jan,2023,1,29,12,2400,Wellness Resort,38,No
B013,Bhutan,Bhutan,Asia,Slow Travel,Sep,2023,2,46,15,9500,Heritage Hotel,95,Yes
B014,Faroe Islands,Denmark,Europe,Coolcation,Jul,2023,3,38,8,5200,Guesthouse,75,No
B015,Tuscany,Italy,Europe,Agritourism,Aug,2023,6,50,14,8800,Villa,70,Yes
B016,Slovenia,Slovenia,Europe,Emerging,Jun,2023,2,35,8,2800,Boutique Hotel,42,No
B017,Patagonia,Argentina,Americas,Coolcation,Jan,2023,2,41,14,6500,Lodge,85,Yes
B018,Kerala,India,Asia,Wellness,Dec,2023,3,44,11,2900,Ayurveda Resort,55,No
B019,Madeira,Portugal,Europe,Coolcation,Mar,2023,4,58,10,4200,Hotel,50,No
B020,Hokkaido,Japan,Asia,Coolcation,Feb,2023,3,45,9,5100,Onsen Hotel,60,No
B021,Iceland,Iceland,Europe,Coolcation,Mar,2024,2,36,11,4200,Boutique Hotel,80,Yes
B022,Bali,Indonesia,Asia,Wellness,Apr,2024,2,34,15,3100,Wellness Resort,52,No
B023,Tuscany,Italy,Europe,Agritourism,Jun,2024,4,49,13,7100,Agriturismo,65,Yes
B024,Dubrovnik,Croatia,Europe,Set-Jetting,Jul,2024,2,30,8,3400,Apartment,35,No
B025,Norway,Norway,Europe,Coolcation,Jun,2024,2,37,12,5900,Cabin,88,No
B026,Kyoto,Japan,Asia,Slow Travel,May,2024,3,40,14,5800,Ryokan,62,Yes
B027,Georgia Wine,Georgia,Asia,Agritourism,Oct,2024,2,44,10,2800,Guesthouse,38,No
B028,Slovenia,Slovenia,Europe,Emerging,May,2024,4,36,9,3600,Boutique Hotel,48,Yes
B029,Azores,Portugal,Europe,Emerging,Jun,2024,2,33,11,3900,Rural House,55,No
B030,Queenstown,New Zealand,Oceania,Multi-Generational,Jan,2024,7,46,14,14500,Villa,72,Yes
B031,Costa Rica,Costa Rica,Americas,Wellness,Mar,2024,2,38,14,4400,Eco Lodge,58,No
B032,Oaxaca,Mexico,Americas,Agritourism,Oct,2024,4,51,10,3900,Hacienda,44,Yes
B033,Faroe Islands,Denmark,Europe,Coolcation,Aug,2024,2,40,9,6100,Guesthouse,82,No
B034,Patagonia,Argentina,Americas,Coolcation,Nov,2024,3,43,16,7800,Lodge,90,Yes
B035,Bhutan,Bhutan,Asia,Slow Travel,Oct,2024,2,48,16,10200,Heritage Hotel,100,No`
  }
};
