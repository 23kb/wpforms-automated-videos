---
slug: a-complete-guide-to-the-checkboxes-field
mode: doc
feature: "Checkboxes field"
audience: beginner
length: standard
depth: balanced
bgm: default
status: emitted
snapshots:
  - { slug: builder-fields, role: primary }
  - { slug: builder-field-options-checkbox, role: swap }
---
## Source

# Using the Checkboxes Field

Do you want to change the appearance of your form's Checkboxes field? WPForms offers many options for customizing how this field looks and works in your published forms.

This article will share all the ways you can customize your WPForms Checkboxes fields.

The Checkboxes field allows users to select multiple options at a time. If you need users to select only one option, where selecting one option should automatically deselect the other, we recommend using the Multiple Choice field instead.

Before you check out the options below, make sure WPForms is installed and activated on your WordPress site. Then create a new form or edit an existing one to open the form builder.

Here, look for Checkboxes under the Standard Fields section. To add a Checkboxes field to your form, click on it or drag and drop it into the preview area of the form builder. Then click on it to open its field options.

## Editing the Field Label and Description

By default, the field's label will be Checkboxes. You can change this text by entering your own custom label in the Field Options panel. Field descriptions provide instructions to your users — type one into the Description field on the same panel.

## Editing, Adding, and Removing Choices

Type your desired text into the choice fields to edit a label. Click the checkbox to the left of a label to preselect it. Drag and drop choices to reorder them.

Click the blue plus button next to any existing option to add a new choice. Click Bulk Add to enter several at once on their own lines, then Add New Choices.

Click the red minus button next to a choice to remove it.

## Using Image Choices

Toggle on Use image choices to display an Upload Image button for each choice. Click it to select an image from your Media Library or computer. Use images 250px square or smaller for best results.

## Using Icon Choices

Toggle on Use icon choices to attach icons to each option. Click a default icon to open the Icon Picker, browse over 2,000 icons, and click one to insert it.

## Generating Choices with WPForms AI

Click the Generate Choices button below the Choices section to have WPForms AI suggest options based on your prompt.

## Requiring the Field

Toggle on the Required setting at the bottom of the general field options to force users to make a selection before submitting.

## Randomizing Choices

In the Advanced tab of the Field Options panel, toggle on Randomize Choices to shuffle the order on each load.

## Displaying Checkboxes in a Multi-Column Layout

Use the Choice Layout dropdown in the Advanced tab to arrange checkboxes in 1, 2, or 3 columns. Choose Inline to place them all on one row, wrapping as needed.

## Limiting Choice Selections for Checkboxes

Enter a number in the Choice Limit field in the Advanced tab to cap how many checkboxes a user may select.

## Using Checkboxes Dynamic Choices

Select Post Type or Taxonomy from the Dynamic Choices dropdown in the Advanced tab to populate choices from site data.

## Hiding the Field Label

Toggle on Hide Label in the Advanced tab to suppress the field's label on the frontend while keeping it visible in entries.

## Enabling the Disclaimer or Terms of Service Display

Toggle on Enable Disclaimer / Terms of Service Display to switch the field into a single-checkbox terms acknowledgment layout. Use the Description field for the terms text and add one choice labeled with the agreement statement.

## Clarifications

_Recorded 2026-04-28 (5-Q alignment pass)._

1. Start state — viewer is a first-time WPForms user landing on the form builder with the Add Fields tab visible right after the standard intro card.
2. Workflow + depth — Checkboxes field core configuration at balanced depth (~2 min): add the field, edit the label, enable Icon Choices (wow 1), open the Advanced tab and switch to a multi-column layout (wow 2), then a closing aside that mentions Required, Choice Limit, Dynamic Choices, Hide Label, and Disclaimer/Terms of Service so viewers know the surface is bigger than what we showed. Out of scope: image-choice end-to-end (mentioned during icon beat as the visual sibling), Bulk Add modal (covered in narration only — interaction adds modal complexity beyond balanced depth), WPForms AI Generate Choices, randomize choices. FAQ section (Smart Tags in checkbox labels, JS minimum-choices) and h4 sub-headings dropped per author direction. Disclaimer/ToS reduced to a one-line mention; full setup not demonstrated.
3. End state — saved Checkboxes field with a custom label, Icon Choices on, and a two-column layout. Standard outro included.
4. Animated moment(s) — cursor-aha as the post-intro mandatory moment, anchored on the Checkboxes field button in the Add Fields panel and labeled "Today, you'll let people pick more than one option." No additional animated moments.
5. Background music — default tutorial BGM.

## Plan

```json
{
  "schemaVersion": 1,
  "animatedMoments": [
    {
      "id": "fields-fly-checkboxes",
      "slot": "post-intro",
      "chapter": "add-checkboxes-field",
      "kind": "cursor-aha",
      "targetHint": "Checkboxes",
      "label": "Today, you'll let people pick more than one option"
    }
  ],
  "manifest": {
    "intro": {
      "eyebrow": "WPForms Tutorial",
      "title": "Customize the Checkboxes field",
      "subtitleHTML": "Give viewers a clean, scannable list of options.",
      "hold": 3.0
    },
    "outro": {
      "eyebrow": "Thanks for watching",
      "title": "That's the Checkboxes field in WPForms.",
      "subtitleHTML": "Learn more at wpforms.com/docs",
      "hold": 3.0
    }
  },
  "chapters": [
    {
      "id": "add-checkboxes-field",
      "title": "Add the Checkboxes field",
      "stateCue": "form builder add fields panel showing standard fields",
      "beats": [
        {
          "id": "drag-checkboxes-field",
          "intent": "Drag the Checkboxes field into the form preview",
          "targetHint": "Checkboxes",
          "narration": "Find Checkboxes in the Add Fields panel and drag it onto your form."
        }
      ]
    },
    {
      "id": "edit-label",
      "title": "Give it a clear label",
      "stateCue": "checkboxes field selected, general field options open showing the label input",
      "beats": [
        {
          "id": "set-label",
          "intent": "Enter a custom label for the Checkboxes field",
          "targetHint": "Label",
          "value": "Pizza Toppings",
          "narration": "Click the field to open its options, then type a label that tells viewers what they're choosing."
        }
      ]
    },
    {
      "id": "icon-choices",
      "title": "Add icons to your choices",
      "stateCue": "general field options showing the use icon choices toggle",
      "beats": [
        {
          "id": "toggle-icon-choices",
          "intent": "Toggle on Use Icon Choices to attach an icon to every option",
          "targetHint": "Use Icon Choices",
          "narration": "Toggle Use Icon Choices to give every option a small icon. Click any default icon afterward to open the Icon Picker and pick from over two thousand options. Image Choices works the same way if you'd rather upload pictures."
        }
      ]
    },
    {
      "id": "multi-column-layout",
      "title": "Lay choices out in columns",
      "stateCue": "advanced field options tab showing the choice layout dropdown",
      "beats": [
        {
          "id": "open-advanced-tab",
          "intent": "Switch to the Advanced field options tab",
          "targetHint": "Advanced",
          "narration": "Switch to the Advanced tab on the field options panel."
        },
        {
          "id": "pick-choice-layout",
          "intent": "Choose Two Columns from the Choice Layout dropdown",
          "targetHint": "Choice Layout",
          "value": "2",
          "narration": "Use Choice Layout to spread choices across two or three columns. Inline puts them all in one row and wraps when there's no space."
        }
      ]
    },
    {
      "id": "hide-label",
      "title": "Hide the field label",
      "stateCue": "advanced field options tab showing the hide label toggle",
      "beats": [
        {
          "id": "open-advanced-tab",
          "intent": "Switch to the Advanced field options tab",
          "targetHint": "Advanced",
          "narration": "Back on the Advanced tab,"
        },
        {
          "id": "toggle-hide-label",
          "intent": "Toggle on Hide Label to drop the label from the rendered form",
          "targetHint": "Hide Label",
          "narration": "toggle Hide Label to drop the label from the rendered form while keeping it visible in entries — handy when the surrounding copy already explains the choices."
        }
      ]
    },
    {
      "id": "required",
      "title": "Make the field required",
      "stateCue": "general field options showing the required toggle",
      "beats": [
        {
          "id": "toggle-required",
          "intent": "Toggle on Required so users must make a selection",
          "targetHint": "Required",
          "narration": "Required forces viewers to pick at least one option before submitting — the asterisk on the label tells them so. Choice Limit caps how many boxes a viewer can tick, Randomize Choices shuffles the order on each load, and Bulk Add, Image Choices, Dynamic Choices, the Disclaimer / Terms of Service mode, the Generate Choices AI helper, and dragging choices to reorder all live in this same panel when you need them."
        }
      ]
    },
    {
      "id": "save-checkboxes-field",
      "title": "Save and close out",
      "stateCue": "form builder save button",
      "beats": [
        {
          "id": "save-form",
          "intent": "Save the form so the Checkboxes settings persist",
          "targetHint": "Save",
          "narration": "Click Save at the top right. Your form is ready for visitors to make their picks."
        }
      ]
    }
  ]
}
```
