import { VirusType, Word } from '../types';

export const getVirusDuration = (type: VirusType): number => {
    switch (type) {
        case 'annihilator':
        case 'reconstruction':
        case 'gang':
        case 'landmine':
        case 'math':
        case 'bomb':
        case 'landmine-field':
            return 3;
        case 'stun':
        case 'swift':
        case 'sloth':
        case 'hide-and-seek':
            return 5;
        default:
            return 0;
    }
};

export const getVirusKoreanName = (type: VirusType): string => {
    const names: Record<VirusType, string> = {
        annihilator: '싹쓸이 바이러스',
        stun: '마취 바이러스',
        reconstruction: '재건 바이러스',
        swift: '날쌘 바이러스',
        sloth: '굼벵이 바이러스',
        'hide-and-seek': '숨바꼭질 바이러스',
        gang: '패거리 바이러스',
        landmine: '지뢰 바이러스',
        math: '정승제 바이러스',
        bomb: '시한폭탄 바이러스',
        'landmine-field': '지뢰밭 바이러스',
    };
    return names[type];
};

export const isTimedVirus = (type: VirusType): boolean => {
    return ['stun', 'swift', 'sloth', 'hide-and-seek'].includes(type);
};
