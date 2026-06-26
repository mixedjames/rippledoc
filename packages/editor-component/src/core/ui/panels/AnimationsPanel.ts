import type {
  Element,
  Section,
  ScrollTrigger,
  KeyFrameAnimation,
  KeyFrameAnimationOptions,
  KeyFrame,
  TranslateStep,
  RotateStep,
  ScaleStep,
  TransformStep,
  Pin,
  SVGImageElement,
} from "@rippledoc/presentation4";
import type { EditorState } from "../../EditorState";
import type { SidebarPanel, PushOperation } from "./SidebarPanel";
import type { EditOperation } from "../../history/EditOperation";

// Default duration for newly added keyframe animations.
const DEFAULT_DURATION_MS = 1000;

type AnimSubject = Element | Section;
type AnimType = "pin" | "keyframe";

type DetailState = {
  subject: AnimSubject;
  animation: KeyFrameAnimation | Pin;
  animType: AnimType;
};

type AddingState = {
  subject: AnimSubject;
  type: AnimType;
};

interface KfCtx {
  anim: KeyFrameAnimation;
  frame: KeyFrame;
  kfIdx: number;
  isSVG: boolean;
}

interface KfNumberRowOpts {
  label: string;
  value: number | undefined;
  unit: string;
  clearable: boolean;
  onCommit: (v: number) => void;
}

function isElement(subject: AnimSubject): subject is Element {
  return "setHorizontalAnchors" in subject;
}

function isSVGImageElement(el: Element): el is SVGImageElement {
  return "subComponent" in el;
}

function isKeyFrameAnimation(
  anim: KeyFrameAnimation | Pin,
): anim is KeyFrameAnimation {
  return "keyFrames" in anim;
}

function triggerLabel(trigger: ScrollTrigger): string {
  return trigger.name || "(unnamed)";
}

/**
 * Sidebar panel for adding and editing scroll animations on a selected element
 * or section.
 *
 * **Three views:**
 * - *List view* — shows all pins (element only) and keyframe animations for
 *   the selected subject, with add/remove controls.
 * - *Trigger picker* — inline list of all presentation triggers to pick from
 *   when adding a new animation.
 * - *Detail view* — drills into a single animation showing trigger, timing,
 *   sub-component target (SVG elements only), and a keyframes stub.
 *
 * Stale-detail guard: on every update(), if the detail_'s animation is no
 * longer in the model (e.g. after undo), detail_ is cleared and the list
 * view is shown instead.
 */
export class AnimationsPanel implements SidebarPanel {
  readonly title = "Animations";
  readonly element: HTMLElement;
  private state_: EditorState;
  private push_: PushOperation;
  private detail_: DetailState | null = null;
  private adding_: AddingState | null = null;
  // Index of the expanded keyframe row within the detail view, or null if all collapsed.
  private expandedKfIdx_: number | null = null;

  constructor(state: EditorState, push: PushOperation) {
    this.state_ = state;
    this.push_ = push;
    this.element = document.createElement("div");
    this.update();
  }

  update(): void {
    this.element.innerHTML = "";
    const sel = this.state_.viewController.selection;
    const { elements, sections } = sel;

    let subject: AnimSubject | null = null;
    if (elements.size === 1) {
      subject = [...elements][0]!;
    } else if (sections.size === 1) {
      subject = [...sections][0]!;
    }

    // Stale-detail guard: clear if subject changed or animation was removed.
    if (this.detail_ !== null) {
      if (this.detail_.subject !== subject) {
        this.detail_ = null;
        this.expandedKfIdx_ = null;
      } else if (subject !== null) {
        const { animType, animation } = this.detail_;
        const stillExists =
          animType === "pin"
            ? (subject as Element).animations.pins.includes(animation as Pin)
            : subject.animations.keyFrameAnimations.includes(
                animation as KeyFrameAnimation,
              );
        if (!stillExists) {
          this.detail_ = null;
          this.expandedKfIdx_ = null;
        }
      }
    }

    if (this.adding_ !== null && this.adding_.subject !== subject) {
      this.adding_ = null;
    }

    if (!subject) {
      const multi = elements.size > 1 || sections.size > 1;
      this.renderEmpty_(
        multi
          ? "Select a single element or section to edit animations."
          : "Select an element or section to edit animations.",
      );
      return;
    }

    if (this.detail_ !== null) {
      this.renderDetail_(this.detail_);
    } else if (this.adding_ !== null) {
      this.renderTriggerPicker_(this.adding_);
    } else {
      this.renderList_(subject);
    }
  }

  dispose(): void {}

  // ── List view ──────────────────────────────────────────────────────────────

  private renderList_(subject: AnimSubject): void {
    const anims = subject.animations;
    const subjectIsEl = isElement(subject);

    const pins = subjectIsEl ? subject.animations.pins : [];
    const keyframes = anims.keyFrameAnimations;

    if (pins.length === 0 && keyframes.length === 0) {
      this.renderEmpty_("No animations. Use the buttons below to add one.");
    }

    if (pins.length > 0) {
      this.renderGroup_(
        "Pins",
        [...pins].map((p) => this.makeAnimRow_(subject, p, "pin")),
      );
    }

    if (keyframes.length > 0) {
      this.renderGroup_(
        "Keyframes",
        [...keyframes].map((a) => this.makeAnimRow_(subject, a, "keyframe")),
      );
    }

    this.renderAddBar_(subject);
  }

  private renderGroup_(title: string, rows: HTMLElement[]): void {
    const group = document.createElement("div");
    group.className = "re-anchor-group";

    const titleEl = document.createElement("div");
    titleEl.className = "re-anchor-group__title";
    titleEl.textContent = title;
    group.appendChild(titleEl);

    for (const row of rows) {
      group.appendChild(row);
    }
    this.element.appendChild(group);
  }

  private makeAnimRow_(
    subject: AnimSubject,
    animation: KeyFrameAnimation | Pin,
    animType: AnimType,
  ): HTMLElement {
    const row = document.createElement("div");
    row.className = "re-anim-row";

    const info = document.createElement("div");
    info.className = "re-anim-row__info";

    const triggerEl = document.createElement("span");
    triggerEl.className = "re-anim-row__trigger";
    triggerEl.textContent = triggerLabel(animation.trigger);
    info.appendChild(triggerEl);

    if (isKeyFrameAnimation(animation)) {
      const meta = document.createElement("span");
      meta.className = "re-anim-row__meta";
      meta.textContent = `${animation.duration}ms${animation.isScrollDriven ? " · driven" : ""}`;
      info.appendChild(meta);
    }

    info.addEventListener("click", () => {
      this.detail_ = { subject, animation, animType };
      this.update();
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "re-anim-remove";
    removeBtn.textContent = "×";
    removeBtn.title = "Remove";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.removeAnimation_(subject, animation, animType);
    });

    row.appendChild(info);
    row.appendChild(removeBtn);
    return row;
  }

  private renderAddBar_(subject: AnimSubject): void {
    const bar = document.createElement("div");
    bar.className = "re-anim-add-bar";

    const noTriggers = this.state_.presentation.triggers.length === 0;
    const disabledTitle = noTriggers
      ? "No scroll triggers — add a scroll trigger first"
      : "";

    if (isElement(subject)) {
      const addPin = document.createElement("button");
      addPin.className = "re-panel-action-btn";
      addPin.textContent = "Add pin";
      addPin.disabled = noTriggers;
      addPin.title = disabledTitle;
      addPin.addEventListener("click", () => {
        this.adding_ = { subject, type: "pin" };
        this.update();
      });
      bar.appendChild(addPin);
    }

    const addKf = document.createElement("button");
    addKf.className = "re-panel-action-btn";
    addKf.textContent = "Add keyframe animation";
    addKf.disabled = noTriggers;
    addKf.title = disabledTitle;
    addKf.addEventListener("click", () => {
      this.adding_ = { subject, type: "keyframe" };
      this.update();
    });
    bar.appendChild(addKf);

    this.element.appendChild(bar);
  }

  // ── Trigger picker ─────────────────────────────────────────────────────────

  private renderTriggerPicker_({ subject, type }: AddingState): void {
    const triggers = [...this.state_.presentation.triggers];

    const title = document.createElement("div");
    title.className = "re-anchor-group__title";
    title.textContent =
      type === "pin" ? "Pick trigger for pin" : "Pick trigger for keyframe";
    this.element.appendChild(title);

    if (triggers.length === 0) {
      this.renderEmpty_("No scroll triggers in presentation.");
    } else {
      for (const trigger of triggers) {
        const row = document.createElement("div");
        row.className = "re-anchor-row re-anchor-row--clickable";
        row.textContent = triggerLabel(trigger);
        row.addEventListener("click", () => {
          this.commitAdd_(subject, type, trigger);
        });
        this.element.appendChild(row);
      }
    }

    const cancel = document.createElement("button");
    cancel.className = "re-panel-action-btn";
    cancel.textContent = "Cancel";
    cancel.style.marginTop = "6px";
    cancel.addEventListener("click", () => {
      this.adding_ = null;
      this.update();
    });
    this.element.appendChild(cancel);
  }

  private commitAdd_(
    subject: AnimSubject,
    type: AnimType,
    trigger: ScrollTrigger,
  ): void {
    if (type === "pin") {
      let created: Pin | null = null;
      const op: EditOperation = {
        execute: () => {
          created = (subject as Element).animations.addPin(trigger);
        },
        undo: () => {
          if (created) (subject as Element).animations.removePin(created);
        },
      };
      this.push_(op);
      this.adding_ = null;
      if (created) {
        this.detail_ = { subject, animation: created, animType: "pin" };
      }
    } else {
      const opts: KeyFrameAnimationOptions = {
        trigger,
        keyFrames: [],
        duration: DEFAULT_DURATION_MS,
        scrollDriven: false,
      };
      let created: KeyFrameAnimation | null = null;
      const op: EditOperation = {
        execute: () => {
          created = subject.animations.addKeyFrameAnimation(opts);
        },
        undo: () => {
          if (created) subject.animations.removeKeyFrameAnimation(created);
        },
      };
      this.push_(op);
      this.adding_ = null;
      if (created) {
        this.detail_ = { subject, animation: created, animType: "keyframe" };
      }
    }
    this.update();
  }

  // ── Detail view ────────────────────────────────────────────────────────────

  private renderDetail_({ subject, animation, animType }: DetailState): void {
    const back = document.createElement("button");
    back.className = "re-anchor-back";
    back.textContent = `← ${animType === "pin" ? "Pin" : "Keyframe animation"}`;
    back.addEventListener("click", () => {
      this.detail_ = null;
      this.expandedKfIdx_ = null;
      this.update();
    });
    this.element.appendChild(back);

    const divider = document.createElement("div");
    divider.className = "re-anchor-detail-divider";
    this.element.appendChild(divider);

    const triggers = [...this.state_.presentation.triggers];
    this.renderTriggerRow_(animation, animType, triggers);

    if (isKeyFrameAnimation(animation)) {
      this.renderDurationRow_(animation);
      this.renderModeRow_(animation);
      if (isElement(subject) && isSVGImageElement(subject)) {
        this.renderSubComponentRow_(animation, subject);
      }
      this.renderKeyframesEditor_(animation, subject);
    }

    this.renderRemoveButton_(subject, animation, animType);
  }

  private renderTriggerRow_(
    animation: KeyFrameAnimation | Pin,
    animType: AnimType,
    triggers: ScrollTrigger[],
  ): void {
    const row = document.createElement("div");
    row.className = "re-anchor-edit-row";

    const label = document.createElement("span");
    label.className = "re-anchor-row__name";
    label.textContent = "trigger";

    const select = document.createElement("select");
    select.className = "re-style-select re-anchor-select";

    if (triggers.length === 0) {
      const opt = document.createElement("option");
      opt.textContent = "(none)";
      select.appendChild(opt);
      select.disabled = true;
    } else {
      for (let i = 0; i < triggers.length; i++) {
        const opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = triggerLabel(triggers[i]!);
        opt.selected = triggers[i] === animation.trigger;
        select.appendChild(opt);
      }
    }

    select.addEventListener("change", () => {
      const idx = parseInt(select.value);
      const newTrigger = triggers[idx];
      if (!newTrigger || newTrigger === animation.trigger) return;
      const oldTrigger = animation.trigger;
      if (animType === "pin") {
        const pin = animation as Pin;
        this.push_({
          execute: () => {
            pin.setTrigger(newTrigger);
            this.update();
          },
          undo: () => {
            pin.setTrigger(oldTrigger);
            this.update();
          },
        });
      } else {
        const anim = animation as KeyFrameAnimation;
        this.push_({
          execute: () => {
            anim.setTrigger(newTrigger);
            this.update();
          },
          undo: () => {
            anim.setTrigger(oldTrigger);
            this.update();
          },
        });
      }
    });

    row.appendChild(label);
    row.appendChild(select);
    this.element.appendChild(row);
  }

  private renderDurationRow_(anim: KeyFrameAnimation): void {
    const row = document.createElement("div");
    row.className = "re-anchor-edit-row";

    const label = document.createElement("span");
    label.className = "re-anchor-row__name";
    label.textContent = "duration";

    const input = document.createElement("input");
    input.type = "number";
    input.className = "re-style-input re-style-input--number";
    input.value = String(anim.duration);
    input.min = "0";

    const unit = document.createElement("span");
    unit.className = "re-anim-unit";
    unit.textContent = "ms";

    let committed = false;
    const doCommit = () => {
      if (committed) return;
      committed = true;
      const ms = parseFloat(input.value);
      if (!isNaN(ms) && ms !== anim.duration) {
        const oldMs = anim.duration;
        this.push_({
          execute: () => {
            anim.setDuration(ms);
            this.update();
          },
          undo: () => {
            anim.setDuration(oldMs);
            this.update();
          },
        });
      }
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doCommit();
      if (e.key === "Escape") {
        committed = true;
        this.update();
      }
    });
    input.addEventListener("blur", doCommit);

    row.appendChild(label);
    row.appendChild(input);
    row.appendChild(unit);
    this.element.appendChild(row);
  }

  private renderModeRow_(anim: KeyFrameAnimation): void {
    const row = document.createElement("div");
    row.className = "re-anchor-edit-row";

    const label = document.createElement("span");
    label.className = "re-anchor-row__name";
    label.textContent = "mode";

    const btn = document.createElement("button");
    btn.className = "re-anim-mode-btn";
    btn.textContent = anim.isScrollDriven ? "Scroll-driven" : "Time-based";
    btn.addEventListener("click", () => {
      const was = anim.isScrollDriven;
      this.push_({
        execute: () => {
          anim.setScrollDriven(!was);
          this.update();
        },
        undo: () => {
          anim.setScrollDriven(was);
          this.update();
        },
      });
    });

    row.appendChild(label);
    row.appendChild(btn);
    this.element.appendChild(row);
  }

  private renderSubComponentRow_(
    anim: KeyFrameAnimation,
    subject: SVGImageElement,
  ): void {
    const row = document.createElement("div");
    row.className = "re-anchor-edit-row";

    const label = document.createElement("span");
    label.className = "re-anchor-row__name";
    label.textContent = "target";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "re-style-input re-style-input--text";
    input.placeholder = "CSS selector";
    input.value = anim.hasTarget ? anim.target.selector : "";

    let committed = false;
    const doCommit = () => {
      if (committed) return;
      committed = true;
      const selector = input.value.trim();

      if (selector === "") {
        if (anim.hasTarget) {
          const oldTarget = anim.target;
          this.push_({
            execute: () => {
              anim.clearTarget();
              this.update();
            },
            undo: () => {
              anim.setTarget(oldTarget);
              this.update();
            },
          });
        }
        return;
      }

      if (anim.hasTarget && anim.target.selector === selector) return;

      const hadTarget = anim.hasTarget;
      const oldTarget = hadTarget ? anim.target : null;
      const newTarget = subject.subComponent(selector);
      this.push_({
        execute: () => {
          anim.setTarget(newTarget);
          this.update();
        },
        undo: () => {
          if (oldTarget) anim.setTarget(oldTarget);
          else anim.clearTarget();
          this.update();
        },
      });
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doCommit();
      if (e.key === "Escape") {
        committed = true;
        this.update();
      }
    });
    input.addEventListener("blur", doCommit);

    row.appendChild(label);
    row.appendChild(input);
    this.element.appendChild(row);
  }

  // ── Keyframes editor ───────────────────────────────────────────────────────

  private renderKeyframesEditor_(
    anim: KeyFrameAnimation,
    subject: AnimSubject,
  ): void {
    const frames = anim.keyFrames;
    const isSVG = isElement(subject) && isSVGImageElement(subject);

    // Section header row: label + count + add button.
    const header = document.createElement("div");
    header.className = "re-kf-section";

    const headerLabel = document.createElement("span");
    headerLabel.className = "re-anchor-row__name";
    headerLabel.textContent = "keyframes";

    const count = document.createElement("span");
    count.className = "re-kf-count";
    count.textContent =
      frames.length === 0
        ? "none"
        : `${frames.length} frame${frames.length === 1 ? "" : "s"}`;

    const addBtn = document.createElement("button");
    addBtn.className = "re-kf-add-btn";
    addBtn.textContent = "+ frame";
    addBtn.addEventListener("click", () => this.addKeyframe_(anim));

    header.appendChild(headerLabel);
    header.appendChild(count);
    header.appendChild(addBtn);
    this.element.appendChild(header);

    for (let i = 0; i < frames.length; i++) {
      this.element.appendChild(
        this.renderKfRow_({ anim, frame: frames[i]!, kfIdx: i, isSVG }),
      );
    }
  }

  private renderKfRow_(ctx: KfCtx): HTMLElement {
    const { anim, frame, kfIdx: idx } = ctx;
    const expanded = this.expandedKfIdx_ === idx;
    const row = document.createElement("div");
    row.className = "re-kf-row";

    // Summary line (always visible, click to toggle expand).
    const summary = document.createElement("div");
    summary.className = "re-kf-summary";

    const arrow = document.createElement("span");
    arrow.className = "re-kf-arrow";
    arrow.textContent = expanded ? "▼" : "▶";

    const pos = document.createElement("span");
    pos.className = "re-kf-pos";
    pos.textContent = `${frame.position}ms`;

    const props = this.kfPropSummary_(frame);
    const propEl = document.createElement("span");
    propEl.className = "re-kf-props-summary";
    propEl.textContent = props || "—";

    const removeBtn = document.createElement("button");
    removeBtn.className = "re-anim-remove";
    removeBtn.textContent = "×";
    removeBtn.title = "Remove keyframe";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.removeKeyframe_(anim, idx);
    });

    summary.appendChild(arrow);
    summary.appendChild(pos);
    summary.appendChild(propEl);
    summary.appendChild(removeBtn);

    summary.addEventListener("click", () => {
      this.expandedKfIdx_ = expanded ? null : idx;
      this.update();
    });

    row.appendChild(summary);

    if (expanded) {
      row.appendChild(this.renderKfDetail_(ctx));
    }

    return row;
  }

  private kfPropSummary_(frame: KeyFrame): string {
    const parts: string[] = [];
    if (frame.opacity !== undefined) parts.push("opacity");
    if (frame.transform !== undefined && frame.transform.length > 0)
      parts.push("transform");
    if (
      frame.backgroundPositionX !== undefined ||
      frame.backgroundPositionY !== undefined
    )
      parts.push("bgPos");
    if (frame.strokeDashoffset !== undefined) parts.push("dashoffset");
    if (frame.traceStroke !== undefined) parts.push("trace");
    return parts.join(", ");
  }

  private renderKfDetail_(ctx: KfCtx): HTMLElement {
    const { anim, frame, kfIdx: idx, isSVG } = ctx;
    const detail = document.createElement("div");
    detail.className = "re-kf-detail";

    detail.appendChild(
      this.renderKfNumberRow_({
        label: "position",
        value: frame.position,
        unit: "ms",
        clearable: false,
        onCommit: (v) => {
          if (isNaN(v)) return;
          const oldFrames = [...anim.keyFrames];
          const newFrame = { ...frame, position: v };
          const unsorted = [...oldFrames];
          unsorted[idx] = newFrame;
          const sorted = [...unsorted].sort((a, b) => a.position - b.position);
          const newIdx = sorted.indexOf(newFrame);
          const capturedIdx = idx;
          this.push_({
            execute: () => {
              anim.setKeyFrames(sorted);
              this.expandedKfIdx_ = newIdx;
              this.update();
            },
            undo: () => {
              anim.setKeyFrames(oldFrames);
              this.expandedKfIdx_ = capturedIdx;
              this.update();
            },
          });
        },
      }),
    );

    detail.appendChild(
      this.renderKfNumberRow_({
        label: "opacity",
        value: frame.opacity,
        unit: "",
        clearable: true,
        onCommit: (v) => this.editKfProp_(ctx, "opacity", v),
      }),
    );

    detail.appendChild(
      this.renderKfNumberRow_({
        label: "bgPosX",
        value: frame.backgroundPositionX,
        unit: "bu",
        clearable: true,
        onCommit: (v) => this.editKfProp_(ctx, "backgroundPositionX", v),
      }),
    );

    detail.appendChild(
      this.renderKfNumberRow_({
        label: "bgPosY",
        value: frame.backgroundPositionY,
        unit: "bu",
        clearable: true,
        onCommit: (v) => this.editKfProp_(ctx, "backgroundPositionY", v),
      }),
    );

    detail.appendChild(
      this.renderKfNumberRow_({
        label: "dashoffset",
        value: frame.strokeDashoffset,
        unit: "",
        clearable: true,
        onCommit: (v) => this.editKfProp_(ctx, "strokeDashoffset", v),
      }),
    );

    if (isSVG) {
      detail.appendChild(
        this.renderKfNumberRow_({
          label: "traceStroke",
          value: frame.traceStroke,
          unit: "%",
          clearable: true,
          onCommit: (v) => this.editKfProp_(ctx, "traceStroke", v),
        }),
      );
    }

    detail.appendChild(this.renderTransformSteps_(ctx));

    return detail;
  }

  /**
   * A single-number property row.
   * When clearable is true, an empty/NaN value removes the property from the keyframe.
   */
  private renderKfNumberRow_({
    label,
    value,
    unit,
    clearable,
    onCommit,
  }: KfNumberRowOpts): HTMLElement {
    const row = document.createElement("div");
    row.className = "re-anchor-edit-row";

    const labelEl = document.createElement("span");
    labelEl.className = "re-anchor-row__name";
    labelEl.textContent = label;

    const input = document.createElement("input");
    input.type = "number";
    input.className = "re-style-input re-style-input--number";
    input.value = value !== undefined ? String(value) : "";
    if (!clearable) input.required = true;

    let committed = false;
    const doCommit = () => {
      if (committed) return;
      committed = true;
      const v = parseFloat(input.value);
      if (isNaN(v) && !clearable) return;
      onCommit(v); // NaN signals "clear" when clearable
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doCommit();
      if (e.key === "Escape") {
        committed = true;
        this.update();
      }
    });
    input.addEventListener("blur", doCommit);

    row.appendChild(labelEl);
    row.appendChild(input);

    if (unit) {
      const unitEl = document.createElement("span");
      unitEl.className = "re-anim-unit";
      unitEl.textContent = unit;
      row.appendChild(unitEl);
    }

    return row;
  }

  /**
   * Generic helper: replace one optional numeric property on a keyframe.
   * NaN means remove the property.
   */
  private editKfProp_(ctx: KfCtx, key: keyof KeyFrame, value: number): void {
    const { anim, frame, kfIdx: idx } = ctx;
    const oldFrames = [...anim.keyFrames];
    const newFrames = [...oldFrames];
    if (isNaN(value)) {
      const copy = { ...frame } as Partial<KeyFrame>;
      delete copy[key];
      newFrames[idx] = copy as KeyFrame;
    } else {
      newFrames[idx] = { ...frame, [key]: value };
    }
    this.push_({
      execute: () => {
        anim.setKeyFrames(newFrames);
        this.update();
      },
      undo: () => {
        anim.setKeyFrames(oldFrames);
        this.update();
      },
    });
  }

  private renderTransformSteps_(ctx: KfCtx): HTMLElement {
    const { frame } = ctx;
    const container = document.createElement("div");
    container.className = "re-transform-list";

    const header = document.createElement("div");
    header.className = "re-kf-transform-header";
    const headerLabel = document.createElement("span");
    headerLabel.className = "re-anchor-row__name";
    headerLabel.textContent = "transform";
    header.appendChild(headerLabel);
    container.appendChild(header);

    const steps = frame.transform ?? [];

    for (let i = 0; i < steps.length; i++) {
      container.appendChild(this.renderTransformStep_(ctx, steps[i]!, i));
    }

    // Add-step buttons.
    const addRow = document.createElement("div");
    addRow.className = "re-transform-add";

    for (const type of ["translate", "rotate", "scale"] as const) {
      const btn = document.createElement("button");
      btn.className = "re-kf-add-btn";
      btn.textContent = `+ ${type}`;
      btn.addEventListener("click", () => this.addTransformStep_(ctx, type));
      addRow.appendChild(btn);
    }

    container.appendChild(addRow);
    return container;
  }

  private renderTransformStep_(
    ctx: KfCtx,
    step: TransformStep,
    stepIdx: number,
  ): HTMLElement {
    const { frame } = ctx;
    const row = document.createElement("div");
    row.className = "re-transform-step";

    const typeLabel = document.createElement("span");
    typeLabel.className = "re-transform-step__type";
    typeLabel.textContent = step.type;
    row.appendChild(typeLabel);

    const vals = document.createElement("span");
    vals.className = "re-transform-step__vals";

    if (step.type === "translate") {
      vals.appendChild(
        this.makeStepInput_("x", step.x ?? 0, (v) =>
          this.editTransformStep_(ctx, stepIdx, {
            ...step,
            x: v,
          } as TranslateStep),
        ),
      );
      vals.appendChild(
        this.makeStepInput_("y", step.y ?? 0, (v) =>
          this.editTransformStep_(ctx, stepIdx, {
            ...step,
            y: v,
          } as TranslateStep),
        ),
      );
    } else if (step.type === "rotate") {
      vals.appendChild(
        this.makeStepInput_("°", step.degrees, (v) =>
          this.editTransformStep_(ctx, stepIdx, {
            type: "rotate",
            degrees: v,
          } as RotateStep),
        ),
      );
    } else {
      // scale
      vals.appendChild(
        this.makeStepInput_("x", step.x, (v) =>
          this.editTransformStep_(ctx, stepIdx, {
            ...step,
            x: v,
          } as ScaleStep),
        ),
      );
      vals.appendChild(
        this.makeStepInput_("y", step.y, (v) =>
          this.editTransformStep_(ctx, stepIdx, {
            ...step,
            y: v,
          } as ScaleStep),
        ),
      );
    }

    row.appendChild(vals);

    // Reorder + remove buttons.
    const controls = document.createElement("span");
    controls.className = "re-transform-step__controls";

    if (stepIdx > 0) {
      const up = document.createElement("button");
      up.className = "re-kf-step-btn";
      up.textContent = "↑";
      up.title = "Move up";
      up.addEventListener("click", () =>
        this.moveTransformStep_(ctx, stepIdx, true),
      );
      controls.appendChild(up);
    }

    if (stepIdx < (frame.transform?.length ?? 0) - 1) {
      const down = document.createElement("button");
      down.className = "re-kf-step-btn";
      down.textContent = "↓";
      down.title = "Move down";
      down.addEventListener("click", () =>
        this.moveTransformStep_(ctx, stepIdx, false),
      );
      controls.appendChild(down);
    }

    const remove = document.createElement("button");
    remove.className = "re-kf-step-btn";
    remove.textContent = "×";
    remove.title = "Remove step";
    remove.addEventListener("click", () =>
      this.removeTransformStep_(ctx, stepIdx),
    );
    controls.appendChild(remove);

    row.appendChild(controls);
    return row;
  }

  private makeStepInput_(
    label: string,
    value: number,
    onCommit: (v: number) => void,
  ): HTMLElement {
    const wrap = document.createElement("span");
    wrap.className = "re-step-input-wrap";

    const lbl = document.createElement("span");
    lbl.className = "re-step-input-label";
    lbl.textContent = label;

    const input = document.createElement("input");
    input.type = "number";
    input.className = "re-style-input re-step-input";
    input.value = String(value);

    let committed = false;
    const doCommit = () => {
      if (committed) return;
      committed = true;
      const v = parseFloat(input.value);
      if (!isNaN(v) && v !== value) onCommit(v);
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doCommit();
      if (e.key === "Escape") {
        committed = true;
        this.update();
      }
    });
    input.addEventListener("blur", doCommit);

    wrap.appendChild(lbl);
    wrap.appendChild(input);
    return wrap;
  }

  private addKeyframe_(anim: KeyFrameAnimation): void {
    const oldFrames = [...anim.keyFrames];
    const newPos = oldFrames.length === 0 ? 0 : Math.round(anim.duration / 2);
    const newFrame: KeyFrame = { position: newPos };
    const sorted = [...oldFrames, newFrame].sort(
      (a, b) => a.position - b.position,
    );
    const newIdx = sorted.indexOf(newFrame);
    this.push_({
      execute: () => {
        anim.setKeyFrames(sorted);
        this.expandedKfIdx_ = newIdx;
        this.update();
      },
      undo: () => {
        anim.setKeyFrames(oldFrames);
        this.expandedKfIdx_ = null;
        this.update();
      },
    });
  }

  private removeKeyframe_(anim: KeyFrameAnimation, idx: number): void {
    const oldFrames = [...anim.keyFrames];
    const newFrames = oldFrames.filter((_, i) => i !== idx);
    const capturedExpanded = this.expandedKfIdx_;
    this.push_({
      execute: () => {
        anim.setKeyFrames(newFrames);
        if (this.expandedKfIdx_ === idx) {
          this.expandedKfIdx_ = null;
        } else if (this.expandedKfIdx_ !== null && this.expandedKfIdx_ > idx) {
          this.expandedKfIdx_--;
        }
        this.update();
      },
      undo: () => {
        anim.setKeyFrames(oldFrames);
        this.expandedKfIdx_ = capturedExpanded;
        this.update();
      },
    });
  }

  private editTransformStep_(
    ctx: KfCtx,
    stepIdx: number,
    newStep: TransformStep,
  ): void {
    const { anim, frame, kfIdx } = ctx;
    const oldFrames = [...anim.keyFrames];
    const newSteps = [...(frame.transform ?? [])];
    newSteps[stepIdx] = newStep;
    const newFrames = [...oldFrames];
    newFrames[kfIdx] = { ...frame, transform: newSteps };
    this.push_({
      execute: () => {
        anim.setKeyFrames(newFrames);
        this.update();
      },
      undo: () => {
        anim.setKeyFrames(oldFrames);
        this.update();
      },
    });
  }

  private addTransformStep_(
    ctx: KfCtx,
    type: "translate" | "rotate" | "scale",
  ): void {
    const { anim, frame, kfIdx } = ctx;
    const oldFrames = [...anim.keyFrames];
    let newStep: TransformStep;
    if (type === "translate") {
      newStep = { type: "translate", x: 0, y: 0 };
    } else if (type === "rotate") {
      newStep = { type: "rotate", degrees: 0 };
    } else {
      newStep = { type: "scale", x: 1, y: 1 };
    }
    const newSteps = [...(frame.transform ?? []), newStep];
    const newFrames = [...oldFrames];
    newFrames[kfIdx] = { ...frame, transform: newSteps };
    this.push_({
      execute: () => {
        anim.setKeyFrames(newFrames);
        this.update();
      },
      undo: () => {
        anim.setKeyFrames(oldFrames);
        this.update();
      },
    });
  }

  private removeTransformStep_(ctx: KfCtx, stepIdx: number): void {
    const { anim, frame, kfIdx } = ctx;
    const oldFrames = [...anim.keyFrames];
    const newSteps = (frame.transform ?? []).filter((_, i) => i !== stepIdx);
    const newFrames = [...oldFrames];
    newFrames[kfIdx] = { ...frame, transform: newSteps };
    this.push_({
      execute: () => {
        anim.setKeyFrames(newFrames);
        this.update();
      },
      undo: () => {
        anim.setKeyFrames(oldFrames);
        this.update();
      },
    });
  }

  private moveTransformStep_(
    ctx: KfCtx,
    stepIdx: number,
    moveTowardFront: boolean,
  ): void {
    const { anim, frame, kfIdx } = ctx;
    const oldFrames = [...anim.keyFrames];
    const steps = [...(frame.transform ?? [])];
    // 0 - 1 = -1 (both 0 and 1 are rule-exempt literals); 1 moves toward back.
    const delta = moveTowardFront ? 0 - 1 : 1;
    const targetIdx = stepIdx + delta;
    if (targetIdx < 0 || targetIdx >= steps.length) return;
    [steps[stepIdx], steps[targetIdx]] = [steps[targetIdx]!, steps[stepIdx]!];
    const newFrames = [...oldFrames];
    newFrames[kfIdx] = { ...frame, transform: steps };
    this.push_({
      execute: () => {
        anim.setKeyFrames(newFrames);
        this.update();
      },
      undo: () => {
        anim.setKeyFrames(oldFrames);
        this.update();
      },
    });
  }

  private renderRemoveButton_(
    subject: AnimSubject,
    animation: KeyFrameAnimation | Pin,
    animType: AnimType,
  ): void {
    const btn = document.createElement("button");
    btn.className = "re-panel-action-btn re-anim-remove-btn";
    btn.textContent = animType === "pin" ? "Remove pin" : "Remove animation";
    btn.addEventListener("click", () => {
      this.detail_ = null;
      this.removeAnimation_(subject, animation, animType);
    });
    this.element.appendChild(btn);
  }

  // ── Shared ─────────────────────────────────────────────────────────────────

  private removeAnimation_(
    subject: AnimSubject,
    animation: KeyFrameAnimation | Pin,
    animType: AnimType,
  ): void {
    if (animType === "pin") {
      const pin = animation as Pin;
      const capTrigger = pin.trigger;
      this.push_({
        execute: () => {
          (subject as Element).animations.removePin(pin);
          this.update();
        },
        undo: () => {
          (subject as Element).animations.addPin(capTrigger);
          this.update();
        },
      });
    } else {
      const anim = animation as KeyFrameAnimation;
      const capturedOpts: KeyFrameAnimationOptions = {
        trigger: anim.trigger,
        keyFrames: [...anim.keyFrames],
        duration: anim.duration,
        scrollDriven: anim.isScrollDriven,
        ...(anim.hasTarget ? { target: anim.target } : {}),
      };
      this.push_({
        execute: () => {
          subject.animations.removeKeyFrameAnimation(anim);
          this.update();
        },
        undo: () => {
          subject.animations.addKeyFrameAnimation(capturedOpts);
          this.update();
        },
      });
    }

    if (this.detail_?.animation === animation) {
      this.detail_ = null;
    }
  }

  private renderEmpty_(message: string): void {
    const msg = document.createElement("span");
    msg.className = "re-panel-empty";
    msg.textContent = message;
    this.element.appendChild(msg);
  }
}
