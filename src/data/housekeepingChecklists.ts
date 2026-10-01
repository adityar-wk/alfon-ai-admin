/** must be fully checked before a room can move from In Progress to Needs Inspection */
export const CLEANING_CHECKLIST = [
  "Remove used amenities and replace with fresh ones",
  "Strip and remake bed with fresh linen",
  "Clean and sanitise bathroom (toilet, sink, shower)",
  "Vacuum carpets and mop hard floors",
  "Dust all surfaces, furniture, and fixtures",
  "Clean mirrors and glass surfaces",
  "Restock minibar and check inventory",
  "Replace stationery and hotel literature",
  "Final walkthrough and quality check",
  "Submit for supervisor inspection",
];

export type InspectionItem = { n: number; section: string; text: string; tag: "Cleanliness" | "Sustainability" | "Service" };

/** the Leading Quality Assurance checklist — must be fully verified before a room can move from Needs Inspection to Inspected */
export const INSPECTION_CHECKLIST: InspectionItem[] = [
  { n: 1, section: "Bedroom", text: "Were the carpet/tiles/wood flooring clean and free of stains/dust?", tag: "Cleanliness" },
  { n: 2, section: "Bedroom", text: "Were all walls, doors, baseboards clean and free of marks/dirt/smudges/dust?", tag: "Cleanliness" },
  { n: 3, section: "Bedroom", text: "Were ceilings, vents, smoke detectors and sprinklers clean and free of any dust?", tag: "Cleanliness" },
  { n: 4, section: "Bedroom", text: "Was the room at a comfortable temperature on arrival?", tag: "Cleanliness" },
  { n: 5, section: "Bedroom", text: "Was the room free of odor on arrival?", tag: "Cleanliness" },
  { n: 6, section: "Bedroom", text: "Was the bed neatly made with clean linen, which was free of stains and tears and was the bed valance/skirting (if applicable) clean and neatly arranged?", tag: "Cleanliness" },
  { n: 7, section: "Bedroom", text: "Was the headboard in excellent condition and if applicable, were the bedspread/blankets/scatter cushions/bolsters clean?", tag: "Cleanliness" },
  { n: 8, section: "Bedroom", text: "Was all upholstered furniture clean and free of stains?", tag: "Cleanliness" },
  { n: 9, section: "Bedroom", text: "Were all the furniture surfaces clean and dust/smear free?", tag: "Cleanliness" },
  { n: 10, section: "Bedroom", text: "Were all the picture/door/mirror frames clean and dust free?", tag: "Cleanliness" },
  { n: 11, section: "Bedroom", text: "Were all the windows/mirrors/chrome/metal surfaces clean and free of smears?", tag: "Cleanliness" },
  { n: 12, section: "Bedroom", text: "Were the curtains/voiles/shutters/blinds clean and properly fitted?", tag: "Cleanliness" },
  { n: 13, section: "Bedroom", text: "Was the wastepaper bin clean and in excellent condition?", tag: "Cleanliness" },
  { n: 14, section: "Bedroom", text: "Was a notepad, pen/pencil available next to each telephone in the room?", tag: "Cleanliness" },
  { n: 15, section: "Bedroom", text: "Was all in-room collateral clean and in excellent condition?", tag: "Cleanliness" },
  { n: 16, section: "Bedroom", text: "Were the wardrobes/drawers clean and free of any scuffs, dust or marks?", tag: "Cleanliness" },
  { n: 17, section: "Bedroom", text: "Was the television clean and correctly tuned in?", tag: "Cleanliness" },
  { n: 18, section: "Bedroom", text: "If there were clocks in the room did they all display the correct time and were they synchronized within 2 minutes of each other and were all alarm clocks reset to no alarm?", tag: "Cleanliness" },
  { n: 19, section: "Bedroom", text: "Were all light fixtures in the bathroom and bedroom working properly and were they clean and dust free?", tag: "Cleanliness" },
  { n: 20, section: "Bedroom", text: "Was the balcony clean, swept and all balcony furniture clean and set up (weather permitting)?", tag: "Cleanliness" },
  { n: 21, section: "Bedroom", text: "Were any pre-arrival requests/personal preferences in place on arrival (e.g. non allergic pillows, baby cot, etc.)?", tag: "Cleanliness" },
  { n: 22, section: "Bedroom", text: "Was all water provided in the room, in glass bottles or alternative eco-friendly containers only (i.e. no plastic bottles)?", tag: "Sustainability" },
  { n: 23, section: "Bedroom", text: "Was local mineral water or hotel filtered bottled water promoted?", tag: "Sustainability" },
  { n: 24, section: "Bedroom", text: "Was the room completely free of pests and insects?", tag: "Cleanliness" },
  { n: 25, section: "Bathroom", text: "Was the bathroom completely mold free?", tag: "Cleanliness" },
  { n: 26, section: "Bathroom", text: "Were the floor, walls, doors and ceiling clean?", tag: "Cleanliness" },
  { n: 27, section: "Bathroom", text: "Were the shower, bath, sink and toilet clean?", tag: "Cleanliness" },
  { n: 28, section: "Bathroom", text: "Were the showerhead and bath/sink taps polished and free of lime scale?", tag: "Cleanliness" },
  { n: 29, section: "Bathroom", text: "Was the shower screen/door clean?", tag: "Cleanliness" },
  { n: 30, section: "Bathroom", text: "Were all counters, shelves and soap dishes clean and dry?", tag: "Cleanliness" },
  { n: 31, section: "Bathroom", text: "Was the wastepaper bin clean and in excellent condition?", tag: "Cleanliness" },
  { n: 32, section: "Bathroom", text: "Was a complete set of unused amenities present on arrival and in the case of large format dispensers, were contents sufficient for the stay?", tag: "Service" },
  { n: 33, section: "Bathroom", text: "Was there a box of tissues, a well presented toilet roll and a spare toilet roll available?", tag: "Cleanliness" },
  { n: 34, section: "Bathroom", text: "Were there 2 x clean drinking water glasses or similar present?", tag: "Cleanliness" },
  { n: 35, section: "Bathroom", text: "Were all towels clean, unstained and in excellent repair?", tag: "Cleanliness" },
  { n: 36, section: "Bathroom", text: "Were bathrobes and slippers present on arrival and were they clean and in excellent repair?", tag: "Cleanliness" },
];

export const TAG_TONE: Record<InspectionItem["tag"], string> = {
  Cleanliness: "bg-sky-50 text-sky-700",
  Sustainability: "bg-emerald-50 text-emerald-700",
  Service: "bg-orange-50 text-orange-700",
};
