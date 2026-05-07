# Helper Rollout Backlog

High-value places to use `popOut`, `cursor.glideTo`, and `lineDraw` without
mass-migrating existing videos. Rollout remains opt-in per storyboard.

## Already shipped

- `form-entries-guide`, `where-entries-2`: replaced the straight cursor move
  from the WPForms sidebar parent to the Entries submenu with
  `cursor.glideTo(..., { via })`.
- `form-notifications`, `managing-3`: replaced the straight cursor move to the
  clone button with `cursor.glideTo(..., { via: block2Head })`.

## Candidates

### form-entries-guide

- `entry-detail`, `detail-1` through `detail-4`: use `popOut` on key panels
  (`entryFields`, `entryNotes`, `entryActions`) instead of highlight-only beats
  when the narration says "this is the thing."
- `search-and-filter`, `search-filter-1`: use `cursor.glideTo` through the
  dropdown trigger while scrubbing search options.
- `where-entries-3`: use `lineDraw` to connect `overviewLastEntryCol` and
  `overviewGraphCol` as a "recency + activity" relationship.
- `export-entries`, `export-2`: use `popOut` on the first export setting row
  before the option sections are discussed.

### form-notifications

- `advanced`, `advanced-1`: use `cursor.glideTo` into the Advanced group title
  before expanding it.
- `conditional-logic`, `cl-2`: use `lineDraw` between field, operator, and
  value cells after the rule is assembled.
- `managing`, `managing-1`: use `popOut` on the Add Notification button before
  the cursor click.
- `smart-tags`: use `cursor.glideTo` from the tag icon to the first dropdown
  item when inserting the `{field_id}` tag.

### Future Non-Baseline Videos

- Any click sequence with a visible waypoint should prefer `cursor.glideTo`.
- Any "source to destination" concept beat should consider `lineDraw`.
- Any single UI object that carries the narration should consider `popOut`
  before defaulting to a ring highlight.
