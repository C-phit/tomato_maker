import type { ModuleNode, HoleValue } from './types';

export const getHoleCount = (node: ModuleNode): number => {
  if (node.type === '3-hole') {
    const centerCount = typeof node.center === 'string' ? 1 : getHoleCount(node.center);
    return 1 + centerCount + 1; // left + center + right
  } else {
    return 2; // left + right
  }
};

export const flattenHoles = (node: ModuleNode): string[] => {
  if (node.type === '3-hole') {
    const centerVals = typeof node.center === 'string' ? [node.center] : flattenHoles(node.center);
    return [node.left, ...centerVals, node.right];
  } else {
    return [node.left, node.right];
  }
};

export const fillHoles = (node: ModuleNode, strings: string[]): { newNode: ModuleNode; remaining: string[] } => {
  if (node.type === '3-hole') {
    const left = strings[0] || '';
    let center: HoleValue;
    let remainingAfterCenter: string[];
    
    if (typeof node.center === 'string') {
      center = strings[1] || '';
      remainingAfterCenter = strings.slice(2);
    } else {
      const result = fillHoles(node.center, strings.slice(1));
      center = result.newNode;
      remainingAfterCenter = result.remaining;
    }
    
    const right = remainingAfterCenter[0] || '';
    return {
      newNode: { ...node, left, center, right },
      remaining: remainingAfterCenter.slice(1),
    };
  } else {
    const left = strings[0] || '';
    const right = strings[1] || '';
    return {
      newNode: { ...node, left, right },
      remaining: strings.slice(2),
    };
  }
};

export const autoFillMirror = (strings: string[]): string[] => {
  const N = strings.length;
  const half = Math.ceil(N / 2);
  const result = [...strings];
  
  // Check if first half is fully filled
  let isHalfFilled = true;
  for (let i = 0; i < half; i++) {
    if (!result[i]) {
      isHalfFilled = false;
      break;
    }
  }
  
  // Also check if they are the ONLY ones filled (or if we just forcefully mirror upon typing the N/2-th char)
  // Actually, we want to mirror whenever the first half is filled.
  if (isHalfFilled) {
    for (let i = 0; i < Math.floor(N / 2); i++) {
      result[N - 1 - i] = result[i];
    }
  }
  
  return result;
};

export const computeGhostStrings = (strings: string[]): string[] => {
  const N = strings.length;
  const ghosts = new Array(N).fill('');
  for (let i = 0; i < N; i++) {
    if (strings[i] === '') {
      if (i >= Math.ceil(N / 2)) {
         const mirrorIndex = N - 1 - i;
         if (strings[mirrorIndex] !== '') {
           ghosts[i] = strings[mirrorIndex];
         }
      }
    }
  }
  return ghosts;
};

export const isPalindrome = (strings: string[]): boolean => {
  if (strings.some(s => s === '')) return false;
  const N = strings.length;
  for (let i = 0; i < Math.floor(N / 2); i++) {
    if (strings[i] !== strings[N - 1 - i]) return false;
  }
  return true;
};
