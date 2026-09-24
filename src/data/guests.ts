export type Guest = {
  id: number;
  name: string;
  initials: string;
  contact: string;
  room: string;
  roomType: string;
  from: string;
  to: string;
  nights: number;
  country: string;
  status: "In House" | "Arriving" | "Checked Out";
  type: "Leisure" | "Business";
  last: string | null;
  msgs?: number;
  tint: string;
};

export const GUESTS: Guest[] = [
  { id: 1, name: "Rohan Sharma", initials: "RS", contact: "+1 212 555 0187", room: "1205", roomType: "Deluxe King", from: "May 14", to: "May 18", nights: 4, country: "India", status: "In House", type: "Leisure", last: "Today, 10:15 AM", msgs: 2, tint: "bg-orange-100 text-orange-700" },
  { id: 2, name: "Emma Davis", initials: "ED", contact: "emma.d@email.com", room: "1608", roomType: "Deluxe Suite", from: "May 20", to: "May 27", nights: 7, country: "United Kingdom", status: "In House", type: "Business", last: "Today, 09:42 AM", msgs: 1, tint: "bg-rose-100 text-rose-700" },
  { id: 3, name: "Ananya Kapoor", initials: "AK", contact: "+1 212 555 0144", room: "908", roomType: "Executive King", from: "May 13", to: "May 17", nights: 4, country: "India", status: "In House", type: "Leisure", last: "Today, 08:30 AM", msgs: 3, tint: "bg-amber-100 text-amber-700" },
  { id: 4, name: "Michael Johnson", initials: "MJ", contact: "mjohnson@email.com", room: "1103", roomType: "Suite", from: "May 10", to: "May 16", nights: 6, country: "United States", status: "In House", type: "Business", last: "Yesterday, 07:15 PM", msgs: 2, tint: "bg-violet-100 text-violet-700" },
  { id: 5, name: "Sarah Chen", initials: "SC", contact: "+1 212 555 0199", room: "704", roomType: "Deluxe King", from: "May 14", to: "May 16", nights: 2, country: "Singapore", status: "In House", type: "Leisure", last: "Yesterday, 06:20 PM", msgs: 1, tint: "bg-sky-100 text-sky-700" },
  { id: 6, name: "David Williams", initials: "DV", contact: "david.w@email.com", room: "1008", roomType: "Executive Twin", from: "May 14", to: "May 19", nights: 5, country: "Australia", status: "In House", type: "Business", last: "Yesterday, 04:10 PM", msgs: 1, tint: "bg-teal-100 text-teal-700" },
  { id: 7, name: "Pooja Patel", initials: "PP", contact: "+1 212 555 0176", room: "602", roomType: "Superior King", from: "May 15", to: "May 17", nights: 2, country: "India", status: "Arriving", type: "Leisure", last: null, tint: "bg-orange-100 text-orange-700" },
  { id: 8, name: "Robert Brown", initials: "RB", contact: "robert.b@email.com", room: "905", roomType: "Superior Twin", from: "May 16", to: "May 20", nights: 4, country: "United States", status: "Arriving", type: "Business", last: null, tint: "bg-rose-100 text-rose-700" },
  { id: 9, name: "Olivia Brown", initials: "OB", contact: "olivia.b@email.com", room: "1203", roomType: "Executive Room", from: "May 15", to: "May 19", nights: 4, country: "Australia", status: "Checked Out", type: "Leisure", last: "May 19, 09:30 AM", tint: "bg-rose-100 text-rose-700" },
  { id: 10, name: "Liam Anderson", initials: "LA", contact: "+1 212 555 0121", room: "2104", roomType: "Deluxe Suite", from: "May 13", to: "May 18", nights: 5, country: "United Kingdom", status: "Checked Out", type: "Business", last: "May 18, 08:40 AM", tint: "bg-sky-100 text-sky-700" },
  { id: 11, name: "Ava Thompson", initials: "AT", contact: "ava.thompson@email.com", room: "2501", roomType: "Junior Suite", from: "May 18", to: "May 23", nights: 5, country: "Canada", status: "Checked Out", type: "Leisure", last: "May 23, 10:05 AM", tint: "bg-teal-100 text-teal-700" },
];
