-- Applied to project tcapxmiroikbsozvucmt on 18 November 2026.
-- Project kit BOMs and totals derive from the owner-supplied robot_selling_price_list_2(1).md.
-- Bundle SKUs are website IDs, not individual component SKUs. Re-running is safe.

UPDATE public.products SET status='archived',orderable=false,public_availability='discontinued',updated_at=now()
WHERE lower(name) LIKE '%resistor%' AND sku IS DISTINCT FROM 'P091' AND status <> 'archived';

INSERT INTO public.categories(name,slug,description,status,sort_order)
VALUES('Project Kits','project-kits','Complete, build-to-order robotics project packages.','published',18)
ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,status='published',sort_order=EXCLUDED.sort_order,updated_at=now();

WITH kit_rows AS (
 SELECT * FROM jsonb_to_recordset('[{"sku":"LFR-T1","slug":"lfr-entry-participation-kit","name":"LFR Line Follower Robot — Tier 1: Entry / Participation Build","short_description":"Entry-level complete line follower robot kit.","price_bdt":4999,"sort_order":1,"description":"COMPLETE BILL OF MATERIALS\n1 × Arduino Nano (ATmega328P) + Nano Expansion Shield [P021, P022]\n1 × TB6612FNG Motor Driver [P064]\n2 × N20 Gear Motors 6V 300 RPM (metal) [P006]; 1 × N20 Aluminum Brackets\n2 × High-grip Silicone Wheels (N20 compatible)\n1 × TCRT5000 5-Channel IR Sensor\n1 × HC-SR04 Ultrasonic Sensor [P036]\n1 × MP1584EN Mini Buck Converter [P074]; 1 × Rocker Switch [P132]\n1 × 7.4V 800mAh 2S LiPo Battery\n1 × 3mm Acrylic Chassis + Mini Metal Ball Caster\n1 × M3 Standoff/Screw Kit + EVA Foam + Jumper Wires [P172 for M3 kit]\n1 × USB-A to Mini-USB Cable + Misc\n\nPACKAGE TOTAL: ৳4,999 (as supplied in the owner''s robot kit price list)."},{"sku":"LFR-T2","slug":"lfr-competitive-kit","name":"LFR Line Follower Robot — Tier 2: Competitive Build","short_description":"Competitive line follower kit with QTR-8A sensing.","price_bdt":7499,"sort_order":2,"description":"COMPLETE BILL OF MATERIALS\n1 × Arduino Nano (ATmega328P) [P021]; 1 × TB6612FNG Motor Driver [P064]\n2 × N20 Gear Motors 6V 600 RPM (metal) [P007]; 1 × N20 Aluminum Brackets\n2 × High-grip Silicone Wheels (34mm)\n1 × Pololu QTR-8A Analog Array [P052]; 1 × HC-SR04 Ultrasonic Sensor [P036]\n1 × MP1584EN Mini Buck Converter [P074]; 1 × Rocker Switch [P132]\n2 × 10k Potentiometers [P151]; 1 × 0.96-inch I2C OLED Display [P029]\n2 × 7.4V 800mAh 2S LiPo Batteries\n1 × 3mm Black Acrylic Chassis + Ball Caster\n1 × M3 Kit + Prototype PCB/Breadboard + EVA Foam + Heat Shrink\n1 × USB-A to Mini-USB Cable\n\nPACKAGE TOTAL: ৳7,499 (as supplied in the owner''s robot kit price list)."},{"sku":"LFR-T3","slug":"lfr-elite-winner-kit","name":"LFR Line Follower Robot — Tier 3: Elite Winner Build","short_description":"Elite line follower kit with encoder motors and ToF sensing.","price_bdt":9999,"sort_order":3,"description":"COMPLETE BILL OF MATERIALS\n1 × ESP32 DevKit V1 [P023]; 1 × TB6612FNG Motor Driver [P064]\n2 × N20 Motors with Quadrature Encoders [P008; out of stock]\n2 × Premium Silicone Racing Wheels\n1 × Pololu QTR-8A Analog Array [P052]; 1 × VL53L1X ToF Sensor [P053]\n1 × MP1584EN Mini Buck Converter [P074]\n1 × 100µF + 100nF Capacitors (100nF match: P103; no separate 100µF match)\n1 × 10k Potentiometers + 5V Passive Buzzer + Rocker Switch [P151, P134, P132]\n3 × 7.4V 800mAh 2S LiPo Batteries\n1 × Custom FR4 PCB Chassis + Mini Metal Ball Caster\n1 × Black 2mm EVA Foam + USB-C Cable + Misc\n\nPACKAGE TOTAL: ৳9,999 (as supplied in the owner''s robot kit price list)."},{"sku":"SB-T1","slug":"soccer-bot-budget-scrapper-kit","name":"Soccer Bot — Tier 1: Budget Scrapper","short_description":"Budget soccer bot package with Bluetooth control.","price_bdt":3999,"sort_order":4,"description":"COMPLETE BILL OF MATERIALS\n1 × Arduino Nano (ATmega328P) [P021]; 1 × HC-05 Bluetooth Module [P175]\n1 × L298N Dual H-Bridge [P063]\n4 × Yellow BO Motors [P009; out of stock]; 4 × 65mm Rubber-rimmed Wheels [P013; out of stock]\n1 × 3S 18650 Battery Holder [P185]; 1 × 1N5408 Diode [P153]\n1 × Sunboard / PVC Chassis\n1 × PVC Bracket + M3 Screws + Wires + Switch\n\nPACKAGE TOTAL: ৳3,999 (as supplied in the owner''s robot kit price list)."},{"sku":"SB-T2","slug":"soccer-bot-precision-striker-kit","name":"Soccer Bot — Tier 2: Precision Striker","short_description":"Precision soccer bot kit with metal gear motors and ESP32.","price_bdt":9999,"sort_order":5,"description":"COMPLETE BILL OF MATERIALS\n1 × ESP32 DevKit V1 [P023]; 1 × TB6612FNG Motor Driver [P064]\n4 × GA25-370 Metal Gear Motors [P011]; 4 × 65mm Silicone-treaded Wheels\n4 × GA25 L-Bracket Mounts [P016]\n1 × 3S 2200mAh LiPo Battery [P189]\n1 × LM2596 Buck Converter [P072]; 1 × XT60 Connector 3S [P163]\n1 × Acrylic/Aluminum Chassis + Bracket + Misc\n\nPACKAGE TOTAL: ৳9,999 (as supplied in the owner''s robot kit price list)."},{"sku":"SB-T3","slug":"soccer-bot-optimized-juggernaut-kit","name":"Soccer Bot — Tier 3: Optimized Juggernaut","short_description":"High-power soccer bot kit with dual 43A motor drivers.","price_bdt":14999,"sort_order":6,"description":"COMPLETE BILL OF MATERIALS\n1 × ESP32 DevKit V1 [P023]; 2 × BTS7960 43A Motor Drivers [P065]\n4 × GA37-555 Metal Gear Motors [P012]; 4 × Wide-track 80mm Wheels [P014; out of stock]\n4 × GA37 Steel L-Brackets [P017]\n1 × 3S 35C High-Discharge LiPo Battery [P191; out of stock]\n1 × XL4015 5A Buck Converter [P075]; 1 × XT60 Connector 3S [P163]\n1 × Aluminum Plate / Hybrid Chassis + Misc\n\nPACKAGE TOTAL: ৳14,999 (as supplied in the owner''s robot kit price list)."},{"sku":"RC-T1","slug":"rc-speed-battle-scrapper-kit","name":"RC Speed Battle — Tier 1: The Scrapper","short_description":"Complete entry-level race bot with push-button remote.","price_bdt":3999,"sort_order":7,"description":"COMPLETE BILL OF MATERIALS\nROBOT:\n1 × ESP32 DevKit V1 [P023]; 1 × L298N Dual H-Bridge [P063]\n4 × Yellow BO Motors [P009; out of stock]; 4 × 65mm Standard Plastic/Rubber Wheels [P001]\n1 × 3S 18650 Battery Holder [P185]; 2 × 1N5408 Diodes [P153]\n1 × Sunboard / PVC Chassis; 1 × Power Switch + Jumper Wires + M3 Screws\nREMOTE:\n1 × ESP32 DevKit V1 [P023]; 1 × 4x Push Buttons\n1 × 9V Battery + Snapper; 1 × Veroboard + Switch + Misc\n\nPACKAGE TOTAL: ৳3,999 (as supplied in the owner''s robot kit price list)."},{"sku":"RC-T2","slug":"rc-speed-battle-striker-kit","name":"RC Speed Battle — Tier 2: The Striker","short_description":"Mid-tier RC speed bot with joystick remote.","price_bdt":9999,"sort_order":8,"description":"COMPLETE BILL OF MATERIALS\nROBOT:\n1 × ESP32 DevKit V1 [P023]; 1 × TB6612FNG Motor Driver [P064]\n4 × GA25-370 Metal Gear Motors [P011]; 4 × 65mm Rubber Wheels [P013]\n4 × GA25 L-Bracket Mounts [P016]; 1 × 3S 1500mAh LiPo Battery\n1 × LM2596 Buck Converter [P072]; 1 × XT60 Connector 3S [P163]\n1 × Hard PVC Chassis + Wires + Heatshrink\nREMOTE:\n1 × ESP32 DevKit V1 [P023]; 1 × 2x Analog Joysticks [P152]\n1 × AA Battery Holder (or 1S LiPo); 1 × Remote Enclosure + Switch + Misc\n\nPACKAGE TOTAL: ৳9,999 (as supplied in the owner''s robot kit price list)."},{"sku":"RC-T3","slug":"rc-speed-battle-juggernaut-kit","name":"RC Speed Battle — Tier 3: The Juggernaut","short_description":"High-power RC speed bot with PS2-style controller.","price_bdt":16999,"sort_order":9,"description":"COMPLETE BILL OF MATERIALS\nROBOT:\n1 × ESP32 DevKit V1 [P023]; 2 × BTS7960 43A Motor Drivers [P065]\n4 × GA37-555 Metal Gear Motors [P012]; 4 × 80mm Off-road Rubber Wheels [P015]\n4 × GA37 Steel L-Brackets [P017]\n1 × 3S 2200mAh 35C LiPo Battery (P189 is 2200mAh but 35C is unverified; no substitution)\n1 × XL4015 5A Buck Converter [P075]; 1 × XT60 Connector 3S [P163]\n1 × Aluminum Plate Chassis + 16AWG Wire + Misc\nREMOTE:\n1 × ESP32 DevKit V1 [P023]; 1 × PS2 Style Controller / Pots + Case\n1 × 2S LiPo Battery (Remote) [P192; out of stock]\n1 × Voltage Indicator + Power Switch + Misc\n\nPACKAGE TOTAL: ৳16,999 (as supplied in the owner''s robot kit price list)."}]'::jsonb)
 AS x(sku text,slug text,name text,short_description text,description text,price_bdt bigint,sort_order integer)
)
INSERT INTO public.products(category_id,sku,slug,name,brand,short_description,description,price_bdt,status,public_availability,orderable,sort_order)
SELECT c.id,k.sku,k.slug,k.name,'Kundu Electronics Project Kits',k.short_description,k.description,k.price_bdt,'published','build_to_order',false,k.sort_order
FROM kit_rows k CROSS JOIN public.categories c WHERE c.slug='project-kits'
ON CONFLICT(sku) WHERE sku IS NOT NULL DO UPDATE
SET slug=EXCLUDED.slug,name=EXCLUDED.name,brand=EXCLUDED.brand,
short_description=EXCLUDED.short_description,description=EXCLUDED.description,
price_bdt=EXCLUDED.price_bdt,status='published',public_availability='build_to_order',
orderable=false,sort_order=EXCLUDED.sort_order,updated_at=now();

-- A product insert trigger first creates an unknown inventory row. Use untracked inventory,
-- then explicitly restore build_to_order availability and orderability.
INSERT INTO public.product_inventory(product_id,tracking_mode,quantity_on_hand,quantity_reserved,low_stock_threshold)
SELECT id,'untracked',NULL,0,NULL FROM public.products
WHERE sku IN ('LFR-T1','LFR-T2','LFR-T3','SB-T1','SB-T2','SB-T3','RC-T1','RC-T2','RC-T3')
ON CONFLICT(product_id) DO UPDATE
SET tracking_mode='untracked',quantity_on_hand=NULL,quantity_reserved=0,low_stock_threshold=NULL,updated_at=now();

UPDATE public.products SET public_availability='build_to_order',orderable=true,updated_at=now()
WHERE sku IN ('LFR-T1','LFR-T2','LFR-T3','SB-T1','SB-T2','SB-T3','RC-T1','RC-T2','RC-T3');

INSERT INTO public.delivery_zones(code,name,coverage_description,delivery_charge_bdt,is_enabled)
VALUES
('standard-12h-1d','Standard · 12 hours–1 day','Expected delivery: 12 hours–1 day. The shop confirms address and availability.',0,true),
('urgent-30m-1h','Urgent · 30–60 minutes','Expected delivery: 30–60 minutes. ৳50 urgent handling. The shop confirms address and availability.',50,true)
ON CONFLICT(code) DO UPDATE SET name=EXCLUDED.name,coverage_description=EXCLUDED.coverage_description,
delivery_charge_bdt=EXCLUDED.delivery_charge_bdt,is_enabled=true,updated_at=now();

UPDATE public.store_settings SET checkout_enabled=true,updated_at=now() WHERE singleton=true;

-- Allow a web order request without taking payment. Payment remains not_submitted until arranged and verified.
DO $migration$
DECLARE
 v_definition text;
 v_old_guard text := $old$
  if coalesce((select s.checkout_enabled from public.store_settings s where s.singleton), false) is not true
     or not exists (select 1 from public.payment_method_settings pms where pms.is_enabled
       and nullif(btrim(pms.receiving_number), '') is not null
       and nullif(btrim(pms.customer_instructions), '') is not null) then
    raise exception using errcode = '55000', message = 'Checkout and at least one manual payment method must be configured';
  end if;
$old$;
 v_new_guard text := $new$
  if coalesce((select s.checkout_enabled from public.store_settings s where s.singleton), false) is not true then
    raise exception using errcode = '55000', message = 'Website checkout is disabled';
  end if;
$new$;
BEGIN
 SELECT pg_get_functiondef('public.create_checkout_order(uuid,text,text,jsonb,jsonb,uuid,uuid)'::regprocedure) INTO v_definition;
 IF position(v_old_guard IN v_definition)=0 THEN
  RAISE EXCEPTION 'Expected checkout payment prerequisite was not found; inspect the function before applying this migration.';
 END IF;
 v_definition:=replace(v_definition,v_old_guard,v_new_guard);
 EXECUTE v_definition;
END;
$migration$;
