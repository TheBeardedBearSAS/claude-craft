import { describe, it, expect } from 'vitest';
import { deriveStoryData, deriveEpicData } from '../../cli/kanban/server/services/markdown-metadata.js';

// Backlogs generated from the claude-craft templates (Project/i18n/<lang>/templates)
// carry their metadata as a "## Metadata" bullet list, not YAML frontmatter.

const FR_STORY = `# US-002 : Détecter les nouveaux tickets

## Métadonnées
- **ID** : US-002
- **EPIC** : EPIC-001
- **Sprint** : 1
- **Statut** : 🟡 In Progress
- **Points** : 3
- **MoSCoW** : Must
- **Persona** : P-003 — Alex

## Traçabilité
- **Dépend de** : US-001, US-007
`;

const EN_TEMPLATE_STORY = `# US-010: Export the report

## Metadata
- **ID**: US-010
- **EPIC**: {EPIC_ID}
- **Sprint**: {SPRINT}
- **Status**: 🟢 Done
- **Points**: 2

## Traceability
- **Depends on**: {US-xxx} <!-- Stories that must be completed first -->
`;

describe('deriveStoryData', () => {
  it('maps a French metadata list (space before colon, emoji status)', () => {
    expect(deriveStoryData(FR_STORY)).toMatchObject({
      id: 'US-002',
      title: 'Détecter les nouveaux tickets',
      epic_id: 'EPIC-001',
      sprint_id: '1',
      status: 'in-progress',
      story_points: 3,
      priority: 'must',
      persona: 'P-003 — Alex',
      dependencies: ['US-001', 'US-007'],
    });
  });

  it('maps the English template and ignores {placeholders}', () => {
    const d = deriveStoryData(EN_TEMPLATE_STORY);
    expect(d).toMatchObject({ id: 'US-010', title: 'Export the report', status: 'done', story_points: 2 });
    expect(d.epic_id).toBeUndefined();
    expect(d.sprint_id).toBeUndefined();
    expect(d.dependencies).toEqual([]);
  });

  it('strips nested HTML comments completely (no residual "<!--")', () => {
    const d = deriveStoryData('# US-011: Nested\n\n- **Persona**: Alex <!<!-- a -->-- hidden -->\n');
    expect(d.persona).toBe('Alex');
  });

  it('treats "—" as no dependency and an unknown status as backlog', () => {
    const d = deriveStoryData('# US-005 : X\n\n- **Statut** : 🔵 Bizarre\n- **Dépend de** : —\n');
    expect(d.id).toBe('US-005'); // falls back on the H1 id
    expect(d.status).toBe('backlog');
    expect(d.dependencies).toEqual([]);
  });

  it('returns {} for a body without any metadata', () => {
    expect(deriveStoryData('Just prose.')).toEqual({});
  });
});

describe('deriveEpicData', () => {
  it('maps epic status onto the epic enum', () => {
    const d = deriveEpicData(
      '# EPIC-004 : Tri suggéré\n\n## Métadonnées\n- **ID** : EPIC-004\n- **Statut** : 🔴 To Do\n'
    );
    expect(d).toMatchObject({ id: 'EPIC-004', title: 'Tri suggéré', status: 'draft' });
    expect(deriveEpicData('# EPIC-005: Y\n- **Status**: 🟡 In Progress').status).toBe('in-progress');
  });
});
