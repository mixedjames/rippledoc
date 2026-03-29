/**
 * The markup for the animation element in the XML file:
 *
 * <animation trigger="someTriggerName" duration="1000">
 *   <keyFrame position="0" opacity="0" />
 *   <keyFrame position="1000" opacity="1" />
 * </animation>
 */
import { KeyFrameAnimationBuilder } from "../animation/keyFrameAnimation/KeyFrameAnimationBuilder";
import { KeyFrame } from "../animation/keyFrameAnimation/KeyFrame";

function getOptionalNumericKeyFrameAttribute(options: {
  element: Element;
  attributeName: string;
}): number | undefined {
  const { element, attributeName } = options;

  const raw = element.getAttribute(attributeName);
  if (raw == null || raw.trim() === "") {
    return undefined;
  }

  const value = Number(raw);
  if (Number.isNaN(value)) {
    throw new Error(
      `<keyFrame> has invalid '${attributeName}' value '${raw}'; expected a number`,
    );
  }

  return value;
}

export function loadAnimation(options: {
  element: Element;
  builder: KeyFrameAnimationBuilder;
}): void {
  const { element, builder } = options;

  const triggerAttr = element.getAttribute("trigger");
  if (!triggerAttr || triggerAttr.trim() === "") {
    throw new Error("<animation> must have a non-empty 'trigger' attribute");
  }
  builder.scrollTrigger = triggerAttr.trim();

  const durationAttr = element.getAttribute("duration");
  if (!durationAttr || durationAttr.trim() === "") {
    throw new Error("<animation> must have a non-empty 'duration' attribute");
  }

  const duration = Number(durationAttr);
  if (Number.isNaN(duration)) {
    throw new Error(
      `<animation> has invalid 'duration' value '${durationAttr}'; expected a number`,
    );
  }
  builder.duration = duration;

  const scrollDrivenAttr = element.getAttribute("scroll-driven");
  if (scrollDrivenAttr != null && scrollDrivenAttr.trim() !== "") {
    const value = scrollDrivenAttr.trim().toLowerCase();
    if (value === "true") {
      builder.scrollDriven = true;
    } else if (value === "false") {
      builder.scrollDriven = false;
    } else {
      throw new Error(
        `<animation> has invalid 'scroll-driven' value '${scrollDrivenAttr}'; expected 'true' or 'false'`,
      );
    }
  }

  let keyFrameCount = 0;

  Array.prototype.forEach.call(element.children, (child: Element) => {
    const tag = child.tagName.toLowerCase();

    if (tag !== "keyframe") {
      // Unknown child elements are ignored for now. Consider tightening this
      // behaviour once the XML schema is stable.
      return;
    }

    const positionAttr = child.getAttribute("position");
    if (!positionAttr || positionAttr.trim() === "") {
      throw new Error("<keyFrame> must have a non-empty 'position' attribute");
    }

    const position = Number(positionAttr);
    if (Number.isNaN(position)) {
      throw new Error(
        `<keyFrame> has invalid 'position' value '${positionAttr}'; expected a number`,
      );
    }

    const opacity = getOptionalNumericKeyFrameAttribute({
      element: child,
      attributeName: "opacity",
    });

    const backgroundPositionX = getOptionalNumericKeyFrameAttribute({
      element: child,
      attributeName: "backgroundPositionX",
    });

    const backgroundPositionY = getOptionalNumericKeyFrameAttribute({
      element: child,
      attributeName: "backgroundPositionY",
    });

    const keyFrame: KeyFrame = {
      position,
      ...(opacity !== undefined ? { opacity } : {}),
      ...(backgroundPositionX !== undefined ? { backgroundPositionX } : {}),
      ...(backgroundPositionY !== undefined ? { backgroundPositionY } : {}),
    };

    builder.addKeyFrame(keyFrame);
    keyFrameCount += 1;
  });

  if (keyFrameCount === 0) {
    throw new Error("<animation> must have at least one <keyFrame> child");
  }
}
