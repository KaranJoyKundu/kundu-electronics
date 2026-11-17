-- Complete 211-SKU customer-facing catalogue import from the owner inventory workbook.
-- Buying price, margin, stock value and supplier data are intentionally excluded.
-- NULL selling prices remain published as price-on-request. NULL stock remains availability-on-request.

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_check;
ALTER TABLE public.products ADD CONSTRAINT products_published_requires_category
  CHECK (status <> 'published'::public.catalogue_status OR category_id IS NOT NULL);
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_check1;
ALTER TABLE public.products ADD CONSTRAINT products_orderable_requires_valid_price_and_availability
  CHECK (NOT orderable OR (price_bdt IS NOT NULL AND public_availability IN (
    'in_stock'::public.public_availability_status, 'low_stock'::public.public_availability_status,
    'backorder'::public.public_availability_status, 'build_to_order'::public.public_availability_status)));

CREATE OR REPLACE FUNCTION private.enforce_product_publication()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_category_status public.catalogue_status;
  v_parent_id uuid;
  v_parent_status public.catalogue_status;
BEGIN
  IF new.status = 'published' THEN
    IF new.category_id IS NULL THEN
      RAISE EXCEPTION USING errcode = '23514', message = 'A published product requires a category';
    END IF;
    IF new.price_bdt IS NOT NULL AND new.price_bdt <= 0 THEN
      RAISE EXCEPTION USING errcode = '23514', message = 'A published product price must be positive when provided';
    END IF;
    SELECT c.status, c.parent_id INTO v_category_status, v_parent_id
      FROM public.categories c WHERE c.id = new.category_id;
    IF NOT found OR v_category_status <> 'published' THEN
      RAISE EXCEPTION USING errcode = '23514', message = 'A published product must belong to a published category';
    END IF;
    IF v_parent_id IS NOT NULL THEN
      SELECT p.status INTO v_parent_status FROM public.categories p WHERE p.id = v_parent_id;
      IF NOT found OR v_parent_status <> 'published' THEN
        RAISE EXCEPTION USING errcode = '23514', message = 'A published product category must have published ancestors';
      END IF;
    END IF;
    IF tg_op = 'INSERT' OR old.status <> 'published' OR new.published_at IS NULL THEN
      new.published_at := now();
    END IF;
  ELSE
    new.published_at := NULL;
  END IF;
  RETURN new;
END;
$function$;

CREATE TEMP TABLE kundu_inventory_211 (
  sku text PRIMARY KEY, product_name text NOT NULL, category_name text NOT NULL,
  selling_price_bdt bigint, stock_quantity bigint, workbook_stock_status text NOT NULL, sku_order integer NOT NULL
) ON COMMIT DROP;
INSERT INTO kundu_inventory_211 VALUES
('P001', '65mm Standard Plastic Wheel', 'Robotics Parts & Mechanical', 290, 10, 'In Stock', 1),
('P002', 'Mini Metal Ball Caster Wheel', 'Robotics Parts & Mechanical', 100, 11, 'In Stock', 2),
('P003', 'Large Metal Ball Caster Wheel', 'Robotics Parts & Mechanical', 95, 10, 'In Stock', 3),
('P004', 'BO Motor 6V 100RPM Geared DC Motor', 'Robotics Parts & Mechanical', 90, 10, 'In Stock', 4),
('P005', '65mm Robot Wheel with Rubber Tyre', 'Robotics Parts & Mechanical', 80, 10, 'In Stock', 5),
('P006', 'N20 Gear Motor 6V 300 RPM (metal / cheap)', 'Robotics Parts & Mechanical', NULL, 10, 'In Stock', 6),
('P007', 'N20 Gear Motor 6V 600 RPM', 'Robotics Parts & Mechanical', NULL, 10, 'In Stock', 7),
('P008', 'N20 Motor with Encoder', 'Robotics Parts & Mechanical', NULL, 0, 'Out of Stock', 8),
('P009', 'Yellow BO Motor (Good)', 'Robotics Parts & Mechanical', 110, 0, 'Out of Stock', 9),
('P010', 'Yellow BO Motor (Low)', 'Robotics Parts & Mechanical', 85, 0, 'Out of Stock', 10),
('P011', 'GA25-370 Metal Gear Motor', 'Robotics Parts & Mechanical', 750, 4, 'Low Stock', 11),
('P012', 'GA37-555 Metal Gear Motor', 'Robotics Parts & Mechanical', NULL, 4, 'Low Stock', 12),
('P013', '65mm Rubber-rimmed Wheel', 'Robotics Parts & Mechanical', 280, 0, 'Out of Stock', 13),
('P014', 'Wide-track 80mm Wheel', 'Robotics Parts & Mechanical', 380, 0, 'Out of Stock', 14),
('P015', 'Off-road Rubber Wheel', 'Robotics Parts & Mechanical', 420, 0, 'Out of Stock', 15),
('P016', 'GA25 L-Bracket Mount', 'Robotics Parts & Mechanical', 140, 4, 'Low Stock', 16),
('P017', 'GA37 Steel L-Bracket', 'Robotics Parts & Mechanical', 185, 4, 'Low Stock', 17),
('P018', 'Stepper Motor Nema 17 (Original)', 'Robotics Parts & Mechanical', 1350, 0, 'Out of Stock', 18),
('P019', 'Arduino Uno SMD', 'Microcontrollers & Development Boards', 550, 10, 'In Stock', 19),
('P020', 'Arduino Uno R3 ATmega328P DIP', 'Microcontrollers & Development Boards', 750, 1, 'Low Stock', 20),
('P021', 'Arduino Nano (ATmega328P)', 'Microcontrollers & Development Boards', 450, 10, 'In Stock', 21),
('P022', 'Arduino Nano Expansion Shield', 'Microcontrollers & Development Boards', 270, 4, 'Low Stock', 22),
('P023', 'ESP32 DevKit v1', 'Microcontrollers & Development Boards', 590, 8, 'In Stock', 23),
('P024', 'ESP32-CAM', 'Microcontrollers & Development Boards', 980, 1, 'Low Stock', 24),
('P025', 'ESP32-S3', 'Microcontrollers & Development Boards', 920, 1, 'Low Stock', 25),
('P026', 'STM32 Blue Pill', 'Microcontrollers & Development Boards', 480, 5, 'In Stock', 26),
('P027', 'STM32 Black Pill', 'Microcontrollers & Development Boards', 670, 0, 'Out of Stock', 27),
('P028', 'NodeMCU (ESP8266)', 'Microcontrollers & Development Boards', 390, 10, 'In Stock', 28),
('P029', '0.96 Inch OLED Display I2C Module', 'Displays', 300, 3, 'Low Stock', 29),
('P030', '16x2 LCD Display Module with I2C', 'Displays', 250, 9, 'In Stock', 30),
('P031', 'MAX7219 8x8 LED Dot Matrix Module', 'Displays', 280, 3, 'Low Stock', 31),
('P032', 'ILI9341 TFT Display (2.8") with touch', 'Displays', 1250, 0, 'Out of Stock', 32),
('P033', 'TP4056 Type-C Lithium Battery Charging Module', 'Sensors & Modules', 35, 190, 'In Stock', 33),
('P034', 'TP4056 Type-C Lithium Battery Charging Module protected variant', 'Sensors & Modules', 40, 10, 'In Stock', 34),
('P035', 'DHT11 Temperature and Humidity Sensor Module', 'Sensors & Modules', 150, 6, 'In Stock', 35),
('P036', 'HC-SR04 Ultrasonic Distance Sensor Module', 'Sensors & Modules', 110, 5, 'In Stock', 36),
('P037', 'SG90 Micro Servo Motor 9G', 'Sensors & Modules', 150, 0, 'Out of Stock', 37),
('P038', 'DT830D Digital Multimeter', 'Sensors & Modules', 300, 10, 'In Stock', 38),
('P039', '9V 600mA AC-DC Transformer', 'Sensors & Modules', 200, 10, 'In Stock', 39),
('P040', 'MPU6050 Gyroscope Accelerometer Module', 'Sensors & Modules', 280, 10, 'In Stock', 40),
('P041', 'PIR Motion Sensor HC-SR501', 'Sensors & Modules', 120, 5, 'In Stock', 41),
('P042', 'MQ-135 Air Quality Gas Sensor', 'Sensors & Modules', 174, 4, 'Low Stock', 42),
('P043', 'MQ-2 Gas Sensor', 'Sensors & Modules', NULL, 10, 'In Stock', 43),
('P044', 'DS3231 RTC Real Time Clock Module', 'Sensors & Modules', 300, 3, 'Low Stock', 44),
('P045', 'Analog Joystick Module KY-023', 'Sensors & Modules', 100, 10, 'In Stock', 45),
('P046', 'FC-51 IR Sensor Module', 'Sensors & Modules', 60, 6, 'In Stock', 46),
('P047', 'KY-026 Flame Sensor Detection Module', 'Sensors & Modules', 80, 8, 'In Stock', 47),
('P048', 'MG995 Metal Gear Servo Motor (full metal)', 'Sensors & Modules', 700, 1, 'Low Stock', 48),
('P049', 'MG995 Metal Gear Servo Motor (metal+plastic)', 'Sensors & Modules', 380, 0, 'Out of Stock', 49),
('P050', 'TCRT5000 IR Line Tracking Sensor Module (single)', 'Sensors & Modules', 130, 10, 'In Stock', 50),
('P051', 'TCRT5000 8-Channel IR Sensor (array)', 'Sensors & Modules', 550, 0, 'Out of Stock', 51),
('P052', 'Pololu QTR-8A Analog Array', 'Sensors & Modules', 780, 10, 'In Stock', 52),
('P053', 'VL53L1X ToF Sensor', 'Sensors & Modules', 550, 2, 'Low Stock', 53),
('P054', 'Rain & Steam Detection Sensor Module', 'Sensors & Modules', 125, 15, 'In Stock', 54),
('P055', 'BMP180 Pressure/Temperature Sensor', 'Sensors & Modules', NULL, 5, 'In Stock', 55),
('P056', 'TTP223 Capacitive Touch Sensor Module', 'Sensors & Modules', NULL, 5, 'In Stock', 56),
('P057', 'RC522 RFID Module + Cards/Tags', 'Sensors & Modules', 195, 4, 'Low Stock', 57),
('P058', 'Cards/Tags', 'Sensors & Modules', 40, 10, 'In Stock', 58),
('P059', 'Fingerprint Sensor (R305 / GT521F32)', 'Sensors & Modules', NULL, 0, 'Out of Stock', 59),
('P060', 'Flex Sensor(original)', 'Sensors & Modules', 1750, 0, 'Out of Stock', 60),
('P061', 'VS 1838 IR Reciever Module', 'Sensors & Modules', NULL, 5, 'In Stock', 61),
('P062', 'Sound Module', 'Sensors & Modules', 150, NULL, 'Not Recorded', 62),
('P063', 'L298N H-Bridge Motor Driver Module', 'Motor Drivers & Controllers', 190, 5, 'In Stock', 63),
('P064', 'TB6612FNG Motor Driver', 'Motor Drivers & Controllers', 520, 15, 'In Stock', 64),
('P065', 'BTS7960 43A Motor Driver', 'Motor Drivers & Controllers', 950, 10, 'In Stock', 65),
('P066', '5V 4 Channel Relay Module', 'Motor Drivers & Controllers', 310, 10, 'In Stock', 66),
('P067', 'Relay 1 Channel', 'Motor Drivers & Controllers', 85, 5, 'In Stock', 67),
('P068', 'LM393 Module LDR Sensor', 'Motor Drivers & Controllers', 75, 7, 'In Stock', 68),
('P069', '28BYJ-48 + ULN2003 Stepper Driver 5V Stepper motor', 'Motor Drivers & Controllers', NULL, 10, 'In Stock', 69),
('P070', 'PCA9685 16-Channel 12-bit PWM/Servo Driver (I2C)', 'Motor Drivers & Controllers', 450, 1, 'Low Stock', 70),
('P071', 'XL6009 DC-DC Boost Converter Module', 'Power Management & Converters', 100, 5, 'In Stock', 71),
('P072', 'LM2596 DC-DC Buck Converter Module', 'Power Management & Converters', 100, 50, 'In Stock', 72),
('P073', 'MT3608 2A DC-DC Boost Converter Module', 'Power Management & Converters', NULL, 5, 'In Stock', 73),
('P074', 'MP1584EN Mini Buck Converter', 'Power Management & Converters', 120, 20, 'In Stock', 74),
('P075', 'XL4015 5A Buck Converter', 'Power Management & Converters', 260, 20, 'In Stock', 75),
('P076', 'BMS Board 3S (20A)', 'Power Management & Converters', NULL, 3, 'Low Stock', 76),
('P077', 'BMS Board 3S (10A)', 'Power Management & Converters', NULL, 2, 'Low Stock', 77),
('P078', '9V Powerbank Module', 'Power Management & Converters', 45, 0, 'Out of Stock', 78),
('P079', 'Large Solderless Breadboard 830 Pin', 'Vero Boards / Prototyping Boards', 150, 80, 'In Stock', 79),
('P080', 'Mini Solderless Breadboard 400 Pin', 'Vero Boards / Prototyping Boards', 90, 9, 'In Stock', 80),
('P081', 'Vero Board Line Type (6.5 x 14.5 cm)', 'Vero Boards / Prototyping Boards', 45, 0, 'Out of Stock', 81),
('P082', 'Veroboard Dot Type (14.5 x 6 cm)', 'Vero Boards / Prototyping Boards', 40, 0, 'Out of Stock', 82),
('P083', 'Vero Board Fiberglass Single Dot Type (15 x 10 cm)', 'Vero Boards / Prototyping Boards', 130, 20, 'In Stock', 83),
('P084', 'Vero Board Fiberglass Single Dot Type Double Sided (15 x 9 cm)', 'Vero Boards / Prototyping Boards', 220, 3, 'Low Stock', 84),
('P085', 'BC547B NPN Transistor', 'Transistors', 5, 100, 'In Stock', 85),
('P086', '2N3905 PNP Transistor', 'Transistors', 5, 100, 'In Stock', 86),
('P087', '2N3819 N-Channel JFET Transistor', 'Transistors', 50, 100, 'In Stock', 87),
('P088', 'IRF630N N-Channel Power MOSFET', 'Transistors', 65, 100, 'In Stock', 88),
('P089', '2N2222 NPN Transistor (replaced 2N2219)', 'Transistors', 20, 100, 'In Stock', 89),
('P090', 'AO3400A MOSFET', 'Transistors', NULL, 0, 'Out of Stock', 90),
('P091', '1kΩ Resistor Box 5000pcs', 'Resistors', 1, 5000, 'In Stock', 91),
('P092', '10kΩ Resistor Box 5000pcs', 'Resistors', 1, 5000, 'In Stock', 92),
('P093', '100kΩ Resistor Box 5000pcs', 'Resistors', 1, 5000, 'In Stock', 93),
('P094', '5W 4.6Ω Power Resistor', 'Resistors', 15, 100, 'In Stock', 94),
('P095', '180kΩ Resistor', 'Resistors', 1, 100, 'In Stock', 95),
('P096', '56kΩ Resistor', 'Resistors', 1, 100, 'In Stock', 96),
('P097', '4.7kΩ Resistor', 'Resistors', 1, 100, 'In Stock', 97),
('P098', '1.8kΩ Resistor', 'Resistors', 1, 100, 'In Stock', 98),
('P099', '300Ω Resistor', 'Resistors', 1, 100, 'In Stock', 99),
('P100', '220Ω Resistor', 'Resistors', 1, 100, 'In Stock', 100),
('P101', '22Ω Resistor', 'Resistors', 1, 100, 'In Stock', 101),
('P102', 'Resistor Assorted Kit 1000pcs (1Ω-10MΩ, 73 values, 1/4W)', 'Resistors', 700, 100, 'In Stock', 102),
('P103', '0.1µF Ceramic Disc Capacitor', 'Capacitors', 5, 100, 'In Stock', 103),
('P104', '10µF Electrolytic Capacitor', 'Capacitors', 10, 100, 'In Stock', 104),
('P105', '47µF Electrolytic Capacitor', 'Capacitors', 15, 0, 'Out of Stock', 105),
('P106', '470µF 25V Electrolytic Capacitor', 'Capacitors', 25, 100, 'In Stock', 106),
('P107', '1000µF 16V Electrolytic Capacitor', 'Capacitors', 30, 100, 'In Stock', 107),
('P108', '10µF 25V Electrolytic Capacitor', 'Capacitors', NULL, 15, 'In Stock', 108),
('P109', 'Electrolytic Capacitor Assorted Kit 100pcs', 'Capacitors', NULL, 100, 'In Stock', 109),
('P110', '7400 Quad 2-Input NAND Gate IC', 'Logic ICs & Regulators', 25, 100, 'In Stock', 110),
('P111', '7402  Quad 2-Input NOR Gate IC', 'Logic ICs & Regulators', 30, 100, 'In Stock', 111),
('P112', '7404 Quad 2-Input NOT Gate IC', 'Logic ICs & Regulators', 25, 100, 'In Stock', 112),
('P113', '7408 Quad 2-Input AND Gate IC', 'Logic ICs & Regulators', 25, 100, 'In Stock', 113),
('P114', '7432 Quad 2-Input OR Gate IC', 'Logic ICs & Regulators', 30, 100, 'In Stock', 114),
('P115', '7486 Quad 2-Input XOR Gate IC', 'Logic ICs & Regulators', 35, 100, 'In Stock', 115),
('P116', '7812 Voltage Regulator IC (also 7805/7809/7808)', 'Logic ICs & Regulators', 30, 100, 'In Stock', 116),
('P117', '7809', 'Logic ICs & Regulators', NULL, 25, 'In Stock', 117),
('P118', '7474 D Flip-Flop IC', 'Logic ICs & Regulators', 40, 100, 'In Stock', 118),
('P119', '7447 BCD to 7-Segment Driver', 'Logic ICs & Regulators', 40, 50, 'In Stock', 119),
('P120', '7490 Decade Counter (original)', 'Logic ICs & Regulators', 40, 25, 'In Stock', 120),
('P121', '7490 Decade Counter (duplicate)', 'Logic ICs & Regulators', 60, 25, 'In Stock', 121),
('P122', '7476 JK Flip-Flop', 'Logic ICs & Regulators', 40, 25, 'In Stock', 122),
('P123', 'NE555 Timer IC', 'Logic ICs & Regulators', NULL, 50, 'In Stock', 123),
('P124', '7493 Binary Counter', 'Logic ICs & Regulators', 55, 10, 'In Stock', 124),
('P125', '74192 Up/Down Counter', 'Logic ICs & Regulators', 60, 10, 'In Stock', 125),
('P126', 'LM317 Adjustable Voltage Regulator IC', 'Logic ICs & Regulators', NULL, 10, 'In Stock', 126),
('P127', 'LM741 Op-Amp', 'Logic ICs & Regulators', 30, 50, 'In Stock', 127),
('P128', 'LM358 / LM324 Op-Amp', 'Logic ICs & Regulators', NULL, 10, 'In Stock', 128),
('P129', '74HC595 Shift Register', 'Logic ICs & Regulators', 40, 10, 'In Stock', 129),
('P130', 'Common Anode 7-Segment Display', 'Logic ICs & Regulators', 35, 50, 'In Stock', 130),
('P131', 'Common Cathod 7-Segment Display', 'Logic ICs & Regulators', 35, 50, 'In Stock', 131),
('P132', 'Rocker Switch', 'Passive Components & Misc', 20, 100, 'In Stock', 132),
('P133', '4x4 Matrix Membrane Keypad', 'Passive Components & Misc', 110, 0, 'Out of Stock', 133),
('P134', 'Passive Buzzer 5V', 'Passive Components & Misc', 25, 100, 'In Stock', 134),
('P135', 'Active Buzzer 5V Module', 'Passive Components & Misc', 25, 10, 'In Stock', 135),
('P136', '4 Pin Tactile Push Button Switch (Small)', 'Passive Components & Misc', 5, 300, 'In Stock', 136),
('P137', '4 Pin Tactile Push Button Switch (Large)', 'Passive Components & Misc', 10, 10, 'In Stock', 137),
('P138', 'IR Transmitter LED (IR LED)', 'Passive Components & Misc', 15, 100, 'In Stock', 138),
('P139', 'IR Receiver Photodiode', 'Passive Components & Misc', 10, 100, 'In Stock', 139),
('P140', 'Ir remote', 'Passive Components & Misc', NULL, 9, 'In Stock', 140),
('P141', '5mm LED — Red', 'Passive Components & Misc', 2, 1000, 'In Stock', 141),
('P142', '5mm LED — White', 'Passive Components & Misc', NULL, 170, 'In Stock', 142),
('P143', '5mm LED — Yellow', 'Passive Components & Misc', NULL, 170, 'In Stock', 143),
('P144', '5mm LED — Blue', 'Passive Components & Misc', NULL, 0, 'Out of Stock', 144),
('P145', '5mm LED — Purple', 'Passive Components & Misc', NULL, 0, 'Out of Stock', 145),
('P146', '5mm LED — Green', 'Passive Components & Misc', NULL, 0, 'Out of Stock', 146),
('P147', 'WS2812B RGB LED Strip 1 Meter', 'Passive Components & Misc', 650, 0, 'Out of Stock', 147),
('P148', '9V Zener Diode (8.2V)', 'Passive Components & Misc', 10, 50, 'In Stock', 148),
('P149', '15V Zener Diode', 'Passive Components & Misc', 10, 50, 'In Stock', 149),
('P150', '500kΩ Potentiometer', 'Passive Components & Misc', 40, 100, 'In Stock', 150),
('P151', '10kΩ Potentiometer', 'Passive Components & Misc', 40, 100, 'In Stock', 151),
('P152', '2x Analog Joystick (bundle)', 'Passive Components & Misc', 180, NULL, 'Not Recorded', 152),
('P153', '1N5408 Diode', 'Passive Components & Misc', 8, 20, 'In Stock', 153),
('P154', '1N4007 Diode', 'Passive Components & Misc', 3, 100, 'In Stock', 154),
('P155', 'Rotary Encoder', 'Passive Components & Misc', NULL, NULL, 'Not Recorded', 155),
('P156', '5W 4.6 ohm Watt resistor', 'Passive Components & Misc', 25, 100, 'In Stock', 156),
('P157', 'Male to Male Jumper Wires 40pcs', 'Wires & Connectors', 100, 90, 'In Stock', 157),
('P158', 'Male to Female Jumper Wires 40pcs', 'Wires & Connectors', 100, 0, 'Out of Stock', 158),
('P159', 'Female to Female Jumper Wires 40pcs', 'Wires & Connectors', 135, 0, 'Out of Stock', 159),
('P160', 'Jumper Box', 'Wires & Connectors', 200, 2, 'Low Stock', 160),
('P161', '16AWG Silicone Wire (roll)', 'Wires & Connectors', 120, 5, 'In Stock', 161),
('P162', 'XT60 Connector 2s', 'Wires & Connectors', 65, 5, 'In Stock', 162),
('P163', 'XT60 Connector 3s', 'Wires & Connectors', NULL, 5, 'In Stock', 163),
('P164', 'SMA Antenna', 'Wires & Connectors', 120, 5, 'In Stock', 164),
('P165', 'Double Sided Tape', 'Wires & Connectors', 80, 2, 'Low Stock', 165),
('P166', 'Zip-Ties (pack)', 'Wires & Connectors', NULL, NULL, 'Not Recorded', 166),
('P167', 'Heat Shrink Tubing (assorted)', 'Wires & Connectors', 250, 1, 'Low Stock', 167),
('P168', 'Screw Terminal Blocks (2-pin, 3-pin)', 'Wires & Connectors', NULL, 0, 'Out of Stock', 168),
('P169', 'JST Connectors (PH2.0 / XH2.54)', 'Wires & Connectors', NULL, 10, 'In Stock', 169),
('P170', 'DC Barrel Jack 5.5mm/2.1mm (male + female)', 'Wires & Connectors', NULL, 10, 'In Stock', 170),
('P171', 'Full Wire Kit', 'Wires & Connectors', NULL, 1, 'Low Stock', 171),
('P172', 'M3 Standoff/Screw Kit', 'Wires & Connectors', 150, 1, 'Low Stock', 172),
('P173', 'Male header', 'Wires & Connectors', 25, 0, 'Out of Stock', 173),
('P174', 'Female header', 'Wires & Connectors', 25, 0, 'Out of Stock', 174),
('P175', 'HC-05 Bluetooth Wireless Module', 'Communication Modules', 415, 3, 'Low Stock', 175),
('P176', 'NEO-6M GPS Module with Antenna', 'Communication Modules', NULL, 3, 'Low Stock', 176),
('P177', 'SX1278 LoRa Module', 'Communication Modules', 950, 5, 'In Stock', 177),
('P178', 'IR Remote Control Kit with TSOP1738 Receiver', 'Communication Modules', NULL, 5, 'In Stock', 178),
('P179', 'Micro SD Card Reader Module', 'Communication Modules', 95, 0, 'Out of Stock', 179),
('P180', 'SIM800L GSM/GPRS Module', 'Communication Modules', NULL, 0, 'Out of Stock', 180),
('P181', '18650 Sunfort Rechargeable Battery', 'Batteries & Power Sources', 110, 100, 'In Stock', 181),
('P182', '1s Charger', 'Batteries & Power Sources', 100, NULL, 'Not Recorded', 182),
('P183', '1S 18650 Battery Holder Case 3.7V', 'Batteries & Power Sources', 30, 100, 'In Stock', 183),
('P184', '2S 18650 Battery Holder Case', 'Batteries & Power Sources', 45, 100, 'In Stock', 184),
('P185', '3S 18650 Battery Holder Case', 'Batteries & Power Sources', 60, 50, 'In Stock', 185),
('P186', '4S 18650 Battery Holder Case', 'Batteries & Power Sources', 70, 10, 'In Stock', 186),
('P187', '2S 900mAh LiPo Battery + Charger', 'Batteries & Power Sources', 2150, 1, 'Low Stock', 187),
('P188', 'Lipo Battery charger', 'Batteries & Power Sources', NULL, 2, 'Low Stock', 188),
('P189', '3S 2200mAh LiPo Battery', 'Batteries & Power Sources', 2950, 1, 'Low Stock', 189),
('P190', '3S 1550mAh LiPo Battery + Charger', 'Batteries & Power Sources', 2500, 1, 'Low Stock', 190),
('P191', '3S 35C High-Discharge LiPo Battery', 'Batteries & Power Sources', NULL, 0, 'Out of Stock', 191),
('P192', '2S LiPo Battery (Remote)', 'Batteries & Power Sources', 1150, 0, 'Out of Stock', 192),
('P193', '9V Battery + Snapper', 'Batteries & Power Sources', 95, 20, 'In Stock', 193),
('P194', '3x AA Battery Holder', 'Batteries & Power Sources', 65, 0, 'Out of Stock', 194),
('P195', 'Sony Battery', 'Batteries & Power Sources', 90, 20, 'In Stock', 195),
('P196', 'Solar Panel 5V-6V', 'Batteries & Power Sources', NULL, 2, 'Low Stock', 196),
('P197', 'Transformar 9-0-9', 'Batteries & Power Sources', 198, NULL, 'Not Recorded', 197),
('P198', 'Helping Hands Soldering Station with Magnifier', 'Tools & Accessories', NULL, 0, 'Out of Stock', 198),
('P199', 'Digital Multimeter Probes Set', 'Tools & Accessories', NULL, 0, 'Out of Stock', 199),
('P200', 'Multipurpose Component Box 15 Slot', 'Tools & Accessories', 175, 100, 'In Stock', 200),
('P201', 'Hot Glue Gun (small)', 'Tools & Accessories', NULL, 3, 'Low Stock', 201),
('P202', 'Soldering Iron Kit (Adjustable 60W, Shared)', 'Tools & Accessories', NULL, 0, 'Out of Stock', 202),
('P203', 'Soldering Iron Kit (Adjustable 60W, Personal)', 'Tools & Accessories', NULL, 0, 'Out of Stock', 203),
('P204', 'Solder Wire 0.8mm/1mm Rosin Core (roll)', 'Tools & Accessories', NULL, 0, 'Out of Stock', 204),
('P205', 'Flux Pen / Paste', 'Tools & Accessories', NULL, 0, 'Out of Stock', 205),
('P206', 'Desoldering Pump / Wick', 'Tools & Accessories', NULL, 0, 'Out of Stock', 206),
('P207', 'INMP441 Microphone', 'Audio / Media', 350, 6, 'In Stock', 207),
('P208', 'PAM8403 Amplifier', 'Audio / Media', 45, 1, 'Low Stock', 208),
('P209', '3W 4Ω Speaker (small)', 'Audio / Media', 85, 0, 'Out of Stock', 209),
('P210', '3W 4Ω Speaker (large)', 'Audio / Media', NULL, 10, 'In Stock', 210),
('P211', 'DFPlayer Mini', 'Audio / Media', NULL, 4, 'Low Stock', 211);

DO $$
BEGIN
  IF (SELECT count(*) FROM kundu_inventory_211) <> 211 THEN RAISE EXCEPTION 'Inventory source must contain 211 unique SKUs'; END IF;
  IF EXISTS (SELECT 1 FROM kundu_inventory_211 s LEFT JOIN public.categories c ON c.name=s.category_name WHERE c.id IS NULL) THEN
    RAISE EXCEPTION 'Inventory import contains a category name not present in public.categories';
  END IF;
END $$;

INSERT INTO public.products (sku, slug, name, category_id, price_bdt, status, public_availability, orderable, sort_order, published_at)
SELECT s.sku,
  trim(both '-' from regexp_replace(lower(regexp_replace(s.product_name, '[^a-zA-Z0-9]+', '-', 'g')), '-+', '-', 'g')) || '-' || lower(s.sku),
  s.product_name, c.id, s.selling_price_bdt, 'published'::public.catalogue_status,
  CASE s.workbook_stock_status WHEN 'In Stock' THEN 'in_stock'::public.public_availability_status
    WHEN 'Low Stock' THEN 'low_stock'::public.public_availability_status
    WHEN 'Out of Stock' THEN 'out_of_stock'::public.public_availability_status
    ELSE 'availability_on_request'::public.public_availability_status END,
  (s.selling_price_bdt IS NOT NULL AND s.stock_quantity > 0 AND s.workbook_stock_status IN ('In Stock','Low Stock')),
  s.sku_order, now()
FROM kundu_inventory_211 s JOIN public.categories c ON c.name=s.category_name
ON CONFLICT (sku) WHERE sku IS NOT NULL DO UPDATE SET
  name=EXCLUDED.name, category_id=EXCLUDED.category_id, price_bdt=EXCLUDED.price_bdt,
  status='published'::public.catalogue_status, public_availability=EXCLUDED.public_availability,
  orderable=EXCLUDED.orderable, sort_order=EXCLUDED.sort_order,
  published_at=COALESCE(public.products.published_at,now()), updated_at=now();

INSERT INTO public.product_inventory (product_id,tracking_mode,quantity_on_hand,low_stock_threshold)
SELECT p.id,
  CASE WHEN s.stock_quantity IS NULL THEN 'unknown'::public.stock_tracking_mode ELSE 'tracked'::public.stock_tracking_mode END,
  s.stock_quantity, 4
FROM kundu_inventory_211 s JOIN public.products p ON p.sku=s.sku
ON CONFLICT (product_id) DO UPDATE SET
  tracking_mode=EXCLUDED.tracking_mode, quantity_on_hand=EXCLUDED.quantity_on_hand,
  low_stock_threshold=COALESCE(public.product_inventory.low_stock_threshold,EXCLUDED.low_stock_threshold),
  updated_at=now();

DO $$
DECLARE v_total integer; v_categories integer;
BEGIN
  SELECT count(*) INTO v_total FROM public.products WHERE status='published'::public.catalogue_status AND sku BETWEEN 'P001' AND 'P211';
  SELECT count(DISTINCT category_id) INTO v_categories FROM public.products WHERE status='published'::public.catalogue_status AND sku BETWEEN 'P001' AND 'P211';
  IF v_total <> 211 THEN RAISE EXCEPTION 'Expected 211 published SKU records; found %', v_total; END IF;
  IF v_categories <> 17 THEN RAISE EXCEPTION 'Expected products in 17 categories; found %', v_categories; END IF;
END $$;
