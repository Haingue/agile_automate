import { type } from 'os';

export enum Shop {
  ITandD = 'IT&D',
  press = 'Press',
  welding = 'Welding',
  paint = 'Paint',
  plastic = 'Plastic',
  assembly = 'Assembly',
}

export enum ActivityType {
  sustain = 'Sustain',
  newValue = 'New value',
  enabler = 'Enabler',
  teamInternal = 'Team internal',
  problemSolving = 'Problem solving',
  memberSkillUp = 'Member skill-up',
}

export enum Label {
  unplanned,
  plant_priority,
}

export type Properties = {
  projectTemplateId: Number;
  initiativeTemplateId: Number;
  documentTemplateId: Number;
  preparationTemplateId: Number;
  doTemplateId: Number;
};
