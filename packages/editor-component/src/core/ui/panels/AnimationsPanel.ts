import type {
  Element,
  Section,
  ScrollTrigger,
  KeyFrameAnimation,
  KeyFrameAnimationOptions,
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
  readonly element: HTMLElement;
  private state_: EditorState;
  private push_: PushOperation;
  private detail_: DetailState | null = null;
  private adding_: AddingState | null = null;

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
      } else if (subject !== null) {
        const { animType, animation } = this.detail_;
        const stillExists =
          animType === "pin"
            ? (subject as Element).animations.pins.includes(animation as Pin)
            : subject.animations.keyFrameAnimations.includes(
                animation as KeyFrameAnimation,
              );
        if (!stillExists) this.detail_ = null;
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
      this.renderKeyframesStub_(animation);
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

  private renderKeyframesStub_(anim: KeyFrameAnimation): void {
    const count = anim.keyFrames.length;

    const row = document.createElement("div");
    row.className = "re-anchor-edit-row";

    const label = document.createElement("span");
    label.className = "re-anchor-row__name";
    label.textContent = "keyframes";

    const val = document.createElement("span");
    val.className = "re-anim-stub";
    val.textContent =
      count === 0 ? "none" : `${count} keyframe${count === 1 ? "" : "s"}`;

    row.appendChild(label);
    row.appendChild(val);
    this.element.appendChild(row);
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
