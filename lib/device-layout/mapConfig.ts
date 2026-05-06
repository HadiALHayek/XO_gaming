export type MapDecoration = {
  id: string;
  label: string;
};

export type MapZone = {
  id: string;
  title: string;
  devices: string[];
  decorations?: MapDecoration[];
};

export type MapFloor = {
  id: string;
  title: string;
  description: string;
  zones: MapZone[];
};

export const deviceLayoutFloors: MapFloor[] = [
  {
    id: "floor-1",
    title: "Floor 1",
    description: "Entry, admin counter, PS4-1/PS4-2, wall section, stairs, and bar.",
    zones: [
      {
        id: "f1-right-wall",
        title: "Right Side Path",
        devices: ["PS4-1", "PS4-2"],
        decorations: [
          { id: "f1-entry", label: "Entry Door" },
          { id: "f1-counter", label: "Admin Counter" },
          { id: "f1-wall", label: "Wall Section" },
          { id: "f1-bar", label: "Bar" },
        ],
      },
      {
        id: "f1-left-area",
        title: "Left Side",
        devices: [],
        decorations: [
          { id: "f1-empty", label: "Empty Wall" },
          { id: "f1-stairs", label: "L Stairs Up" },
        ],
      },
    ],
  },
  {
    id: "floor-2",
    title: "Floor 2",
    description:
      "After stairs turn left: right wall has PS4-3/PS4-4, and center table has facing PC rows.",
    zones: [
      {
        id: "f2-right-wall",
        title: "Right Wall",
        devices: ["PS4-3", "PS4-4"],
      },
      {
        id: "f2-table-left",
        title: "Center Table - Left Row",
        devices: ["PC-5", "PC-4", "PC-3", "PC-2", "PC-1"],
      },
      {
        id: "f2-table-right",
        title: "Center Table - Right Row",
        devices: ["PC-10", "PC-9", "PC-8", "PC-7", "PC-6"],
      },
    ],
  },
];
