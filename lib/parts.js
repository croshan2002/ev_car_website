/*
 * Every part a visitor can open in the explorer. Edit names and text here.
 *
 * `match` decides which meshes belong to a part: the names of a mesh's ancestors in the model are
 * tested closest first, so "BodyDoorRMirror" wins over the "BodyDoorRColor1" door it hangs on.
 * `mat` narrows that to some materials (a wheel is one node holding rim, tyre, disc and caliper).
 * `with` keeps other parts on screen for context, e.g. the nose around the headlights.
 * `focus` shows only this branch when the part is viewed alone (one wheel instead of four).
 * `from` is the angle it is first seen from: [around, above] in degrees. 0 = right side, 90 = nose.
 */
export const PART_GROUPS = ['Body', 'Glass and lights', 'Wheels and drive', 'Interior']

export const PARTS = [
  // Body
  { id: 'hood', group: 'Body', name: 'Bonnet and nose', match: /^BodyHood/, from: [60, 25], text: 'One aluminium clamshell. It covers the front motor and a storage well.', specs: ['Aluminium', 'Clamshell opening'] },
  { id: 'shell', group: 'Body', name: 'Pillars and roof rails', match: /^BodyPillars/, from: [30, 20], text: 'The structure along each side of the cabin. It carries the roof and frames the doors.', specs: ['High-strength steel', 'Bonded aluminium'] },
  { id: 'roof', group: 'Body', name: 'Roof panel', match: /^BodyRoofPanel/, from: [30, 40], text: 'The centre spine of the roof, between the two sheets of glass.', specs: ['Carbon composite'] },
  { id: 'door', group: 'Body', name: 'Doors', match: /^BodyDoor[RL]/, focus: /^BodyDoorR/, from: [15, 12], text: 'Frameless doors with flush handles. Each one swings out on a front hinge.', specs: ['Flush handles', 'Frameless glass'] },
  { id: 'mirror', group: 'Body', name: 'Door mirrors', match: /^BodyDoor[RL]Mirror/, focus: /^BodyDoorRMirror/, from: [-70, 10], text: 'Slim mirrors on a single arm, shaped to keep wind noise away from the windows.', specs: ['Heated', 'Power folding'] },
  { id: 'lower', group: 'Body', name: 'Sills and aero panels', match: /^BodyPanelsColor2/, from: [30, 15], text: 'Dark lower panels that steer air around the wheels and along the sides.', specs: ['Recycled composite'] },
  { id: 'rear', group: 'Body', name: 'Rear body and hatch', match: /^(BodyRearPanels|InteriorRear)/, from: [-60, 20], text: 'The tail and the hatch. It opens to 620 litres with the seats up.', specs: ['620 L boot'] },

  // Glass and lights
  { id: 'windshield', group: 'Glass and lights', name: 'Windscreen', match: /^BodyWindshield($|Gasket)/, from: [60, 25], text: 'Laminated acoustic glass, swept back to meet the roof.', specs: ['Laminated', 'Acoustic layer'] },
  { id: 'wipers', group: 'Glass and lights', name: 'Wipers', match: /^BodyWindshieldWipers/, with: ['windshield'], from: [60, 35], text: 'Two blades that park below the bonnet line.', specs: ['Rain sensing'] },
  { id: 'rearglass', group: 'Glass and lights', name: 'Rear glass', match: /^(BodyRearwindow|BodyWindowsRear)/, from: [-55, 30], text: 'The rear window and quarter lights. Part of the 2.1 m² of glass overhead.', specs: ['Blocks 99% UV'] },
  { id: 'headlights', group: 'Glass and lights', name: 'Headlights', match: /^BodyHeadlights/, with: ['hood'], from: [70, 10], text: 'An LED blade with 2,400 pixels. It dips itself for oncoming traffic.', specs: ['LED', '2,400 pixels'] },
  { id: 'taillights', group: 'Glass and lights', name: 'Tail lights', match: /^(BodyTaillights|BodyTurnsignals)/, with: ['rear'], from: [-75, 12], text: 'The rear light and turn signals, set edge to edge under the glass.', specs: ['LED'] },

  // Wheels and drive
  { id: 'rim', group: 'Wheels and drive', name: 'Wheel rim', match: /^Wheel/, mat: /^Rim/, focus: /^WheelFrontR/, from: [20, 8], text: 'The finish follows the wheel you pick in the configurator.', specs: ['20 or 21 inch'] },
  { id: 'tyre', group: 'Wheels and drive', name: 'Tyre', match: /^Wheel/, mat: /^Tire/, focus: /^WheelFrontR/, from: [35, 10], text: 'Low rolling resistance tyre with a foam lining for a quieter cabin.', specs: ['Foam lined'] },
  { id: 'disc', group: 'Wheels and drive', name: 'Brake disc', match: /^Wheel/, mat: /^Disc/, focus: /^WheelFrontR/, from: [25, 8], text: 'Drilled disc. Most everyday slowing is done by the motors, so it lasts longer.', specs: ['Drilled', 'Ventilated'] },
  { id: 'caliper', group: 'Wheels and drive', name: 'Brake caliper', match: /^Wheel/, mat: /^Brake/, focus: /^WheelFrontR/, from: [35, 12], text: 'Fixed caliper, painted in VOLTA amber.', specs: ['Multi-piston'] },
  { id: 'motor', group: 'Wheels and drive', name: 'Front drive unit', match: /^Engine/, from: [50, 25], text: 'The housing at the front of the car that holds the motor on AWD versions.', specs: ['800 V'] },
  { id: 'axles', group: 'Wheels and drive', name: 'Hub mounts', match: /^Axles/, with: ['disc'], from: [40, 30], text: 'Where the drive reaches each wheel, shown with the four brake discs.', specs: ['Front and rear'] },
  { id: 'floor', group: 'Wheels and drive', name: 'Underbody', match: /^BodyUnderside/, with: ['mats', 'lower'], from: [35, -28], text: 'The sealed floor of the car. The battery sits flat inside it, which keeps the weight low.', specs: ['Sealed underbody', '800 V pack'] },

  // Interior
  { id: 'seats', group: 'Interior', name: 'Seats', match: /^InteriorSeats/, from: [50, 20], text: 'Shell seats with red inserts. The driver sits in the middle, with a seat on each side and one behind.', specs: ['Heated', 'Ventilated'] },
  { id: 'steering', group: 'Interior', name: 'Steering wheel', match: /^InteriorSteering(Cylinder|Handle|Base|DashColumn)/, from: [-60, 20], text: 'Flat-bottomed wheel with paddles behind it to set the regenerative braking.', specs: ['Regen paddles'] },
  { id: 'display', group: 'Interior', name: 'Driver display', match: /^InteriorSteeringDash$/, from: [-80, 8], text: 'Speed, charge and temperature, right behind the wheel.', specs: ['Follows the column'] },
  { id: 'dash', group: 'Interior', name: 'Dashboard', match: /^InteriorDash/, from: [-60, 30], text: 'A wide, low dashboard that leaves the view ahead clear.', specs: ['Soft-touch trim'] },
  { id: 'pedals', group: 'Interior', name: 'Pedals', match: /^InteriorPedal/, from: [-60, 25], text: 'Accelerator and brake. Lift off and the car slows by itself with regen.', specs: ['One-pedal driving'] },
  { id: 'console', group: 'Interior', name: 'Inner sills', match: /^InteriorMid/, from: [40, 35], text: 'The inside of the door openings, between the floor and the pillars.', specs: ['Sound deadened'] },
  { id: 'mats', group: 'Interior', name: 'Floor and mats', match: /^InteriorFloor/, from: [40, 45], text: 'Cabin floor with removable mats.', specs: ['Removable'] },
  { id: 'trim', group: 'Interior', name: 'Door trim', match: /^InteriorDoor/, focus: /^InteriorDoorR/, from: [-160, 10], text: 'Inner door panel with armrest, pull and release.', specs: ['Soft-touch trim'] },
  { id: 'frame', group: 'Interior', name: 'Cabin frame', match: /^Interior(Cage|Pillar)/, from: [40, 25], text: 'The frame around the cabin that protects it from above and behind.', specs: ['Structural'] },
]

export const PART = Object.fromEntries(PARTS.map((p) => [p.id, p]))

// Parts marked with a dot when looking around from a seat, and where: [forward, up, right] in metres.
export const INSIDE_PINS = {
  steering: [0.69, 0.71, 0.14],
  display: [1.12, 0.75, 0],
  dash: [0.95, 0.68, 0.6],
  pedals: [1.26, 0.2, -0.08],
  seats: [-0.64, 0.95, 0.5],
  trim: [0.25, 0.68, 0.84],
  roof: [-0.15, 1.08, 0.2],
}

/*
 * Where each piece goes in the exploded view, in metres: [forward, up, right].
 * A child moves together with its parent, plus its own offset.
 */
export const EXPLODE = {
  BodyRoofPanel: [0, 1.5, 0],
  BodyWindshield: [0.7, 1.05, 0],
  BodyWindshieldGasket: [0.6, 0.9, 0],
  BodyWindshieldWipers: [1.0, 0.75, 0],
  BodyWindshieldWipersBase: [0.95, 0.65, 0],
  BodyPillars: [0, 0.85, 0],
  InteriorCage: [0, 0.6, 0],
  InteriorPillar: [-0.45, 0.45, 0],
  BodyHood: [1.25, 0.25, 0],
  BodyHeadlights: [0.45, 0.1, 0],
  BodyHoodTopgrill: [0, 0.35, 0],
  BodyRearPanelsColor1: [-1.25, 0.15, 0],
  BodyRearwindow: [0, 0.75, 0],
  BodyWindowsRearSides: [0, 0.6, 0],
  BodyTaillights: [-0.45, 0.1, 0],
  BodyTaillightsPanels: [-0.25, 0.1, 0],
  BodyTurnsignalsRear: [-0.45, 0.25, 0],
  BodyDoorRColor1: [0, 0.1, 1.15],
  BodyDoorLColor1: [0, 0.1, -1.15],
  BodyDoorRMirror: [0, 0, 0.35],
  BodyDoorRMirrorColor1: [0, 0, 0.35],
  BodyDoorRMirrorColor2: [0, 0, 0.35],
  BodyDoorLMirror: [0, 0, -0.35],
  BodyDoorLMirrorColor1: [0, 0, -0.35],
  BodyDoorLMirrorColor2: [0, 0, -0.35],
  BodyDoorRWindow: [0, 0.35, 0],
  BodyDoorLWindow: [0, 0.35, 0],
  BodyPanelsColor2: [0, -0.45, 0],
  WheelFrontR: [0.25, 0, 0.95],
  WheelFrontL: [0.25, 0, -0.95],
  WheelRearR: [-0.25, 0, 0.95],
  WheelRearL: [-0.25, 0, -0.95],
  WheelFrontRBrakeDisc: [0, 0, -0.4],
  WheelRearRBrakeDisc: [0, 0, -0.4],
  WheelFrontLBrakeDisc: [0, 0, 0.4],
  WheelRearLBrakeDisc: [0, 0, 0.4],
  WheelFrontRBrakePad: [0, 0, -0.25],
  WheelRearRBrakePad: [0, 0, -0.25],
  WheelFrontLBrakePad: [0, 0, 0.25],
  WheelRearLBrakePad: [0, 0, 0.25],
  WheelFrontRRim: [0, 0, 0.35],
  WheelRearRRim: [0, 0, 0.35],
  WheelFrontLRim: [0, 0, -0.35],
  WheelRearLRim: [0, 0, -0.35],
  Axles: [0, -0.3, 0],
  Engine: [0.55, 0.15, 0],
  InteriorDashMid: [0.3, 0.45, 0],
  InteriorDashSides: [0.3, 0.45, 0],
  InteriorSteeringBase: [0.15, 0.5, 0],
  InteriorSteeringCylinder: [0, 0.55, 0],
  InteriorSteeringDash: [0.2, 0.65, 0],
  InteriorSteeringDashColumn: [0.15, 0.55, 0],
  InteriorSteeringHandleL: [0, 0.55, 0],
  InteriorSteeringHandleR: [0, 0.55, 0],
  InteriorSeatsColor1: [0, 0.5, 0],
  InteriorSeatsColor2: [0, 0.5, 0],
  InteriorSeatsFrame1: [0, 0.4, 0],
  InteriorSeatsFrame2: [0, 0.4, 0],
}
