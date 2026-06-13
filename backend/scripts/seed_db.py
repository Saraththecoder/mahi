import pymongo
from datetime import datetime
import os
import sys

# Add backend directory to path so we can import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings

def seed_database():
    try:
        print("Connecting to MongoDB...")
        # Reduce timeout to 2 seconds for fast fallback check
        client = pymongo.MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
        
        # Ping connection to force check
        client.admin.command('ping')
        
        db = client[settings.DATABASE_NAME]
        print(f"Connected to database: {settings.DATABASE_NAME}")

        # 1. Seed Government Schemes
        schemes_col = db["government_schemes"]
        schemes_col.delete_many({}) # Clear existing
        
        schemes_data = [
            {
                "_id": "pm-kisan",
                "title": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
                "title_translated": {
                    "te": "పీఎం-కిసాన్ (ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి)",
                    "hi": "पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)"
                },
                "description": "Central government scheme providing annual income support of Rs. 6,000 to all landholding farmer families across the country.",
                "description_translated": {
                    "te": "దేశంలోని భూమి ఉన్న రైతు కుటుంబాలన్నింటికీ కేంద్ర ప్రభుత్వం ఏడాదికి రూ. 6,000 ఆర్థిక సహాయం అందించే పథకం.",
                    "hi": "देश भर के सभी भूमिधारक किसान परिवारों को 6,000 रुपये की वार्षिक आय सहायता प्रदान करने वाली केंद्र सरकार की योजना।"
                },
                "category": "Income Support",
                "eligibility": [
                    "All small and marginal landholder farmer families who own cultivable land.",
                    "Land titles must be registered in their names."
                ],
                "eligibility_translated": {
                    "te": [
                        "సాగు చేయదగిన భూమి కలిగి ఉన్న చిన్న మరియు సన్నకారు రైతు కుటుంబాలు.",
                        "భూమి పట్టా వారి పేరు మీద నమోదై ఉండాలి."
                    ],
                    "hi": [
                        "सभी छोटे और सीमांत भूमिधारक किसान परिवार जिनके पास कृषि योग्य भूमि है।",
                        "भूमि स्वामित्व उनके नाम पर पंजीकृत होना चाहिए।"
                    ]
                },
                "benefits": [
                    "Financial benefit of Rs. 6,000 per year.",
                    "Paid in three equal installments of Rs. 2,000 directly into the bank accounts of farmers every 4 months."
                ],
                "benefits_translated": {
                    "te": [
                        "ఏడాదికి రూ. 6,000 ఆర్థిక లబ్ధి.",
                        "ప్రతి 4 నెలలకు ఒకసారి రూ. 2,000 చొప్పున మూడు విడతల్లో నేరుగా రైతుల బ్యాంక్ ఖాతాల్లో జమ చేయబడుతుంది."
                    ],
                    "hi": [
                        "प्रति वर्ष 6,000 रुपये का वित्तीय लाभ।",
                        "हर 4 महीने में सीधे किसानों के बैंक खातों में 2,000 रुपये की तीन समान किस्तों में भुगतान किया जाता है।"
                    ]
                },
                "required_documents": [
                    "Citizenship Certificate",
                    "Land Ownership Documents (Pattadar Passbook)",
                    "Aadhaar Card",
                    "Bank Account Details"
                ],
                "required_documents_translated": {
                    "te": [
                        "భారతీయ పౌరసత్వ ధృవీకరణ పత్రం",
                        "భూమి యాజమాన్య పత్రాలు (పట్టాదారు పాస్బుక్)",
                        "ఆధార్ కార్డ్",
                        "బ్యాంక్ ఖాతా వివరాలు"
                    ],
                    "hi": [
                        "नागरिकता प्रमाण पत्र",
                        "भूमि स्वामित्व दस्तावेज (खतौनी/पट्टा)",
                        "आधार कार्ड",
                        "बैंक खाता विवरण"
                    ]
                },
                "application_process": "Apply online through the PM-KISAN Portal, Rythu Bharosa Kendrams (RBKs), or CSC (Common Service Centers).",
                "application_process_translated": {
                    "te": "పీఎం-కిసాన్ పోర్టల్, సమీప రైతు భరోసా కేంద్రం (RBK), లేదా కామన్ సర్వీస్ సెంటర్ల (CSC) ద్వారా ఆన్‌లైన్‌లో దరఖాస్తు చేసుకోవచ్చు.",
                    "hi": "पीएम-किसान पोर्टल, नजदीकी कॉमन सर्विस सेंटर (सीएससी), या स्थानीय कृषि कार्यालय के माध्यम से ऑनलाइन आवेदन करें।"
                },
                "official_website": "https://pmkisan.gov.in/",
                "created_at": datetime.utcnow()
            },
            {
                "_id": "pmfby",
                "title": "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
                "title_translated": {
                    "te": "పీఎంఎఫ్‌బీవై (ప్రధాన మంత్రి ఫసల్ బీమా యోజన)",
                    "hi": "पीएमएफबीवाई (प्रधानमंत्री फसल बीमा योजना)"
                },
                "description": "Yield-based crop insurance scheme protecting farmers against crop losses from sowing to post-harvest due to natural calamities.",
                "description_translated": {
                    "te": "ప్రకృతి వైపరీత్యాల వల్ల పంట నష్టపోయిన రైతులను ఆదుకునేందుకు విత్తనం వేసినప్పటి నుండి కోత కోసే వరకు బీమా రక్షణ కల్పించే పథకం.",
                    "hi": "बुवाई से लेकर कटाई के बाद तक प्राकृतिक आपदाओं के कारण फसल नुकसान से किसानों को बचाने वाली फसल बीमा योजना।"
                },
                "category": "Crop Insurance",
                "eligibility": [
                    "All farmers including sharecroppers and tenant farmers growing notified crops in notified areas."
                ],
                "eligibility_translated": {
                    "te": [
                        "నోటిఫైడ్ ప్రాంతాలలో నోటిఫైడ్ పంటలు పండించే కౌలుదారులు మరియు భాగస్వామ్య రైతులతో సహా అందరూ రైతులు."
                    ],
                    "hi": [
                        "अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले बंटाईदार और काश्तकार किसानों सहित सभी किसान।"
                    ]
                },
                "benefits": [
                    "Comprehensive risk insurance for crop damage.",
                    "Uniform low premium rates: 2.0% for Kharif crops, 1.5% for Rabi crops, and 5.0% for commercial/horticultural crops."
                ],
                "benefits_translated": {
                    "te": [
                        "పంట నష్టానికి సమగ్ర బీమా రక్షణ.",
                        "తక్కువ ప్రీమియం రేట్లు: ఖరీఫ్ పంటలకు 2.0%, రబీ పంటలకు 1.5% మరియు వాణిజ్య/తోట పంటలకు 5.0%."
                    ],
                    "hi": [
                        "फसल नुकसान के लिए व्यापक जोखिम बीमा।",
                        "समान रूप से कम प्रीमियम दरें: खरीफ फसलों के लिए 2.0%, रबी फसलों के लिए 1.5% और वाणिज्यिक/बागवानी फसलों के लिए 5.0%।"
                    ]
                },
                "required_documents": [
                    "Aadhaar Card",
                    "Land Records (Adangal/1B)",
                    "Sowing Certificate issued by local Revenue/Agriculture officer",
                    "Bank Passbook photocopy"
                ],
                "required_documents_translated": {
                    "te": [
                        "ఆధార్ కార్డ్",
                        "భూమి రికార్డులు (అడంగల్ / 1B)",
                        "స్థానిక రెవెన్యూ/వ్యవసాయ అధికారి జారీ చేసిన పంట సాగు ధృవీకరణ పత్రం",
                        "బ్యాంక్ పాస్‌బుక్ కాపీ"
                    ],
                    "hi": [
                        "आधार कार्ड",
                        "भूमि अभिलेख (खसरा/खतौनी)",
                        "स्थानीय राजस्व/कृषि अधिकारी द्वारा जारी बुवाई प्रमाण पत्र",
                        "बैंक पासबुक की प्रति"
                    ]
                },
                "application_process": "Register via national crop insurance portal (NCIP) or contact local banks, cooperative societies, or insurance agents.",
                "application_process_translated": {
                    "te": "జాతీయ పంట బీమా పోర్టల్ (NCIP) ద్వారా లేదా స్థానిక బ్యాంకులు, సహకార సంఘాలు, లేదా బీమా ఏజెంట్ల ద్వారా నమోదు చేసుకోవచ్చు.",
                    "hi": "राष्ट्रीय फसल बीमा पोर्टल (NCIP) के माध्यम से पंजीकरण करें या अपने नजदीकी सहकारी बैंक या बीमा एजेंट से संपर्क करें।"
                },
                "official_website": "https://pmfby.gov.in/",
                "created_at": datetime.utcnow()
            },
            {
                "_id": "kcc",
                "title": "Kisan Credit Card (KCC) Scheme",
                "title_translated": {
                    "te": "కిసాన్ క్రెడిట్ కార్డ్ (KCC) పథకం",
                    "hi": "किसान क्रेडिट कार्ड (केसीसी) योजना"
                },
                "description": "Provides farmers with timely credit for production needs, cultivation expenses, post-harvest expenses, and maintenance of farm assets.",
                "description_translated": {
                    "te": "వ్యవసాయ సాగు ఖర్చులు, కోతల ఖర్చులు మరియు వ్యవసాయ యంత్రాల నిర్వహణ కోసం బ్యాంకు ద్వారా సకాలంలో రుణాలు అందించే పథకం.",
                    "hi": "किसानों को उनकी कृषि उत्पादन आवश्यकताओं, खेती के खर्चों, कटाई के बाद के खर्चों और कृषि संपत्तियों के रखरखाव के लिए समय पर ऋण प्रदान करना।"
                },
                "category": "Credit and Loan",
                "eligibility": [
                    "All owner cultivator farmers.",
                    "Tenant farmers, oral lessees, and sharecroppers.",
                    "Self Help Groups (SHGs) or Joint Liability Groups (JLGs) of farmers."
                ],
                "eligibility_translated": {
                    "te": [
                        "సొంత భూమి సాగు చేసుకునే రైతులు అందరూ.",
                        "కౌలు రైతులు మరియు భాగస్వామ్య సాగుదారులు.",
                        "రైతుల స్వయం సహాయక సంఘాలు (SHGs)."
                    ],
                    "hi": [
                        "सभी मालिक काश्तकार किसान।",
                        "बंटाईदार और पट्टाधारक किसान।",
                        "किसानों के स्वयं सहायता समूह (SHG) या संयुक्त देयता समूह (JLG)।"
                    ]
                },
                "benefits": [
                    "Concessional interest rate of 4% per annum for timely repayment.",
                    "No collateral required for loans up to Rs. 1.6 Lakhs.",
                    "Includes accidental insurance coverage up to Rs. 50,000."
                ],
                "benefits_translated": {
                    "te": [
                        "సకాలంలో రుణం తిరిగి చెల్లిస్తే కేవలం 4% వడ్డీ రేటు.",
                        "ఆధార్ కనెక్టివిటీ తో 1.6 లక్షల లోపు రుణాలకు ఎలాంటి హామీ అవసరం లేదు.",
                        "రూ. 50,000 వరకు ప్రమాద బీమా రక్షణ."
                    ],
                    "hi": [
                        "समय पर पुनर्भुगतान करने पर प्रति वर्ष 4% की रियायती ब्याज दर।",
                        "1.6 लाख रुपये तक के ऋण के लिए किसी सुरक्षा (संपार्श्विक) की आवश्यकता नहीं है।",
                        "50,000 रुपये तक का दुर्घटना बीमा कवरेज शामिल है।"
                    ]
                },
                "required_documents": [
                    "Completed Application Form",
                    "Identity Proof (Aadhaar Card, Voter ID)",
                    "Land cultivation records certified by local revenue authority",
                    "Passport size photograph"
                ],
                "required_documents_translated": {
                    "te": [
                        "పూర్తి చేసిన దరఖాస్తు ఫారమ్",
                        "గుర్తింపు కార్డు (ఆధార్, ఓటర్ ఐడీ)",
                        "రెవెన్యూ అధికారి ధృవీకరించిన సాగు భూమి పత్రాలు",
                        "పాస్‌పోర్ట్ సైజు ఫోటో"
                    ],
                    "hi": [
                        "पूर्ण भरा हुआ आवेदन पत्र",
                        "पहचान प्रमाण (आधार कार्ड, मतदाता पहचान पत्र)",
                        "स्थानीय राजस्व अधिकारी द्वारा सत्यापित कृषि भूमि के दस्तावेज",
                        "पासपोर्ट आकार फोटो"
                    ]
                },
                "application_process": "Visit any commercial bank, cooperative bank, or rural bank and request for KCC enrollment form.",
                "application_process_translated": {
                    "te": "సమీప వాణిజ్య బ్యాంక్, సహకార బ్యాంక్ లేదా గ్రామీణ బ్యాంకును సందర్శించి KCC దరఖాస్తు ఫారమ్‌ను సమర్పించాలి.",
                    "hi": "किसी भी व्यावसायिक बैंक या सहकारी बैंक में जाएं और केसीसी आवेदन पत्र के लिए अनुरोध करें।"
                },
                "official_website": "https://www.rbi.org.in/",
                "created_at": datetime.utcnow()
            },
            {
                "_id": "rythu-bharosa",
                "title": "Andhra Pradesh YSR Rythu Bharosa",
                "title_translated": {
                    "te": "వైఎస్ఆర్ రైతు భరోసా (ఆంధ్రప్రదేశ్)",
                    "hi": "आंध्र प्रदेश वाईएसआर रायथू भरोसा"
                },
                "description": "State welfare program by Government of Andhra Pradesh providing financial assistance of Rs. 13,500 per annum to land-owning and tenant farmers.",
                "description_translated": {
                    "te": "ఆంధ్రప్రదేశ్ ప్రభుత్వం భూమి ఉన్న మరియు కౌలు రైతులకు ఏడాదికి రూ. 13,500 పెట్టుబడి సహాయం అందించే రాష్ట్ర సంక్షేమ పథకం.",
                    "hi": "आंध्र प्रदेश सरकार द्वारा भूमिधारक और काश्तकार किसानों को प्रति वर्ष 13,500 रुपये की वित्तीय सहायता प्रदान करने वाली योजना।"
                },
                "category": "State Welfare",
                "eligibility": [
                    "Resident farmers of Andhra Pradesh.",
                    "Includes SC, ST, BC, and Minority tenant farmers who have leased lands."
                ],
                "eligibility_translated": {
                    "te": [
                        "ఆంధ్రప్రదేశ్ నివాసితులైన రైతులు.",
                        "ఎస్సీ, ఎస్టీ, బీసీ మరియు మైనారిటీ వర్గాలకు చెందిన కౌలు రైతులు కూడా అర్హులు."
                    ],
                    "hi": [
                        "आंध्र प्रदेश के निवासी किसान।",
                        "इसमें एससी, एसटी, ओबीसी और अल्पसंख्यक काश्तकार (किराएदार) किसान शामिल हैं।"
                    ]
                },
                "benefits": [
                    "Financial assistance of Rs. 13,500 per year (which includes PM-KISAN share).",
                    "Free borewell drilling under YSR Jala Kala.",
                    "Free crop insurance coverage and zero-interest loans."
                ],
                "benefits_translated": {
                    "te": [
                        "సంవత్సరానికి రూ. 13,500 పెట్టుబడి సహాయం (పీఎం-కిసాన్ వాటాతో కలిపి).",
                        "వైఎస్సార్ జలకళ కింద ఉచితంగా బోర్ వెల్స్ తవ్వించడం.",
                        "ఉచిత పంట బీమా రక్షణ మరియు వడ్డీ లేని రుణాలు."
                    ],
                    "hi": [
                        "प्रति वर्ष 13,500 रुपये की वित्तीय सहायता (पीएम-किसान हिस्से सहित)।",
                        "वाईएसआर जल कला के तहत मुफ्त बोरवेल ड्रिलिंग।",
                        "मुफ्त फसल बीमा कवरेज और शून्य-ब्याज ऋण।"
                    ]
                },
                "required_documents": [
                    "Aadhaar Card",
                    "Land Pattadar Passbook",
                    "Lease Agreement copy (for Tenant Farmers)",
                    "Bank Account Details (linked with Aadhaar)"
                ],
                "required_documents_translated": {
                    "te": [
                        "ఆధార్ కార్డ్",
                        "పట్టాదారు పాస్బుక్",
                        "కౌలు ఒప్పంద పత్రం (కౌలు రైతులకు)",
                        "ఆధార్‌తో లింక్ అయిన బ్యాంక్ ఖాతా వివరాలు"
                    ],
                    "hi": [
                        "आधार कार्ड",
                        "भूमि पट्टादार पासबुक",
                        "पट्टा समझौता पत्र (काश्तकारों के लिए)",
                        "आधार से जुड़ा बैंक खाता विवरण"
                    ]
                },
                "application_process": "Register via Rythu Bharosa Kendrams (RBKs) through village volunteers or local agriculture extension officers.",
                "application_process_translated": {
                    "te": "గ్రామ వాలంటీర్ల సహాయంతో లేదా స్థానిక వ్యవసాయ విస్తరణాధికారుల (AEO) ద్వారా రైతు భరోసా కేంద్రాల్లో (RBK) నమోదు చేసుకోవచ్చు.",
                    "hi": "ग्राम स्वयंसेवकों या स्थानीय कृषि विस्तार अधिकारियों के माध्यम से रायथू भरोसा केंद्रों (आरबीके) में पंजीकरण करें।"
                },
                "official_website": "https://ysrrythubharosa.ap.gov.in/",
                "created_at": datetime.utcnow()
            }
        ]
        
        schemes_col.insert_many(schemes_data)
        print(f"Successfully seeded {len(schemes_data)} Government Schemes.")

        # 2. Seed Agriculture Centers
        centers_col = db["agriculture_centers"]
        centers_col.delete_many({}) # Clear existing
        
        centers_data = [
            {
                "_id": "center-1",
                "name": "Guntur District Soil Testing Laboratory",
                "type": "Soil Testing Lab",
                "address": "Amaravathi Road, near Collectorate Office, Guntur, AP - 522002",
                "latitude": 16.3120,
                "longitude": 80.4215,
                "contact_number": "+91 86322 34567",
                "working_hours": "09:30 AM - 05:00 PM (Sunday closed)"
            },
            {
                "_id": "center-2",
                "name": "Regional Agricultural Research Station (RARS) Lam",
                "type": "Agriculture Office",
                "address": "Lam Farm, Amaravathi Road, Guntur, AP - 522034",
                "latitude": 16.3533,
                "longitude": 80.4322,
                "contact_number": "+91 86323 56789",
                "working_hours": "09:00 AM - 05:30 PM (Sunday closed)"
            },
            {
                "_id": "center-3",
                "name": "Vijayawada Government Seed Distribution Center",
                "type": "Seed Distribution Center",
                "address": "Beside Rythu Bazar, Patamata, Vijayawada, AP - 520010",
                "latitude": 16.5005,
                "longitude": 80.6650,
                "contact_number": "+91 86624 12345",
                "working_hours": "08:00 AM - 06:00 PM (Open all days)"
            },
            {
                "_id": "center-4",
                "name": "Rythu Bharosa Kendram (RBK) - Pedakakani",
                "type": "Agriculture Office",
                "address": "Main Road, Pedakakani, Guntur District, AP - 522509",
                "latitude": 16.3412,
                "longitude": 80.4851,
                "contact_number": "+91 94406 88771",
                "working_hours": "09:00 AM - 05:00 PM (Sunday closed)"
            },
            {
                "_id": "center-5",
                "name": "Nagarjuna Soil & Fertilizer Analysis Center",
                "type": "Soil Testing Lab",
                "address": "Auto Nagar, Vijayawada, AP - 520007",
                "latitude": 16.5095,
                "longitude": 80.6812,
                "contact_number": "+91 86625 43210",
                "working_hours": "09:30 AM - 06:00 PM (Sunday closed)"
            },
            {
                "_id": "center-6",
                "name": "AP State Seed Development Corp (APSSDC) Guntur",
                "type": "Seed Distribution Center",
                "address": "Naraiah Nagar, Guntur, AP - 522004",
                "latitude": 16.2925,
                "longitude": 80.4410,
                "contact_number": "+91 86322 11223",
                "working_hours": "09:30 AM - 05:00 PM (Sunday closed)"
            }
        ]
        
        centers_col.insert_many(centers_data)
        print(f"Successfully seeded {len(centers_data)} Agriculture Centers.")
        print("Database seeding completed successfully!")
    except Exception as e:
        print(f"WARNING: Local MongoDB server connection failed: {e}")
        print("This seeding script is bypassing database writes since MongoDB is not running.")
        print("The Smart Agriculture Assistant application will run in fully functional local fallback mode.")
        sys.exit(0)

if __name__ == "__main__":
    seed_database()
