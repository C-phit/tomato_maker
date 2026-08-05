export type ModuleType = '3-hole' | '2-hole';
export type HoleValue = string | ModuleNode;

export type ModuleNode = Module3Hole | Module2Hole;

export interface Module3Hole {
  id: string;
  type: '3-hole';
  left: string;
  center: HoleValue;
  right: string;
}

export interface Module2Hole {
  id: string;
  type: '2-hole';
  left: string;
  right: string;
}

export type AppMode = 'tomato' | 'newspaper';
