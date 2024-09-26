export const eventData = {
  capacity: 1000,
  areas: [
    { id: 1, name: "Main Stage" },
    { id: 2, name: "VIP Area" },
    { id: 3, name: "Food Court" },
  ],
  entrances: [
    { id: 1, name: "Main Entrance" },
    { id: 2, name: "VIP Entrance" },
  ],
  controlPoints: [
    { id: 1, name: "Security Checkpoint 1" },
    { id: 2, name: "Security Checkpoint 2" },
  ],
  routes: [
    { id: 1, entrance: 1, controlPoint: 1, area: 1 },
    { id: 2, entrance: 2, controlPoint: 2, area: 2 },
    { id: 3, entrance: 1, controlPoint: 1, area: 3 },
  ],
};
