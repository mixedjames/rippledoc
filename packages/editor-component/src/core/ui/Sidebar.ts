import type { MarkdownElement } from "@rippledoc/presentation4";
import type { EditorState } from "../EditorState";
import type { EditOperation } from "../history/EditOperation";
import type { AnchorPickResult } from "../tools/AnchorPickerTool";
import { CollapsiblePanel } from "./panels/CollapsiblePanel";
import { StylesPanel } from "./panels/StylesPanel";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { AnchorsPanel } from "./panels/AnchorsPanel";
import { AnimationsPanel } from "./panels/AnimationsPanel";
import type { SidebarPanel } from "./panels/SidebarPanel";

/**
 * Assembles and owns the three sidebar panels: Styles, Properties, and Anchors.
 * Acts as the accordion controller: exactly one panel is open at a time.
 * Headers are always visible; only the open panel's body scrolls.
 *
 * The sidebar does not subscribe to any events directly. Instead,
 * `EditorComponentImpl` calls `update()` whenever the selection changes, and
 * the sidebar fans it out to every panel. Panels fully re-render their content on
 * each update (innerHTML reset + rebuild) rather than diffing — acceptable at this
 * scale, and simpler than tracking incremental state.
 *
 * Panels receive `push` (the operation write path) and `requestPick` (the anchor
 * pick interrupt) rather than a reference to `EditorComponentImpl` directly,
 * keeping the coupling narrow and the panel interfaces easy to test.
 */
export class Sidebar {
  readonly element: HTMLElement;
  private panels_: SidebarPanel[];
  private accordionPanels_: CollapsiblePanel[];
  private activeAccordionPanel_: CollapsiblePanel | null = null;

  constructor(
    state: EditorState,
    push: (op: EditOperation) => void,
    requestPick: (callback: (result: AnchorPickResult) => void) => void,
    openMarkdownEditor: (element: MarkdownElement) => void,
  ) {
    this.element = document.createElement("div");
    this.element.className = "re-sidebar";

    const styles = new StylesPanel(state, push);
    const properties = new PropertiesPanel(state, push, openMarkdownEditor);
    const anchors = new AnchorsPanel(state, push, requestPick);
    const animations = new AnimationsPanel(state, push);
    this.panels_ = [styles, properties, anchors, animations];

    const panelDefs: [string, SidebarPanel][] = [
      ["Styles", styles],
      ["Anchors", anchors],
      ["Properties", properties],
      ["Animations", animations],
    ];
    this.accordionPanels_ = panelDefs.map(
      ([title, panel], i) =>
        new CollapsiblePanel(title, panel.element, () =>
          this.openAccordionPanel_(i),
        ),
    );

    for (const accordionPanel of this.accordionPanels_) {
      this.element.appendChild(accordionPanel.element);
    }

    // Properties open by default (index 2).
    // TODO: restore last-active panel when persistence is added.
    this.openAccordionPanel_(2);
  }

  private openAccordionPanel_(index: number): void {
    const isAlreadyOpen =
      this.activeAccordionPanel_ === this.accordionPanels_[index];
    const target = isAlreadyOpen
      ? (index + 1) % this.accordionPanels_.length
      : index;
    this.activeAccordionPanel_?.close();
    this.activeAccordionPanel_ = this.accordionPanels_[target]!;
    this.activeAccordionPanel_.open();
  }

  update(): void {
    for (const panel of this.panels_) {
      panel.update();
    }
  }

  dispose(): void {
    for (const panel of this.panels_) {
      panel.dispose();
    }
  }
}
