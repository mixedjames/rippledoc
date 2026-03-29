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

    const opacityAttr = child.getAttribute("opacity");
    let opacity: number | undefined;

    if (opacityAttr != null && opacityAttr.trim() !== "") {
      const parsedOpacity = Number(opacityAttr);
      if (Number.isNaN(parsedOpacity)) {
        throw new Error(
          `<keyFrame> has invalid 'opacity' value '${opacityAttr}'; expected a number`,
        );
      }
      opacity = parsedOpacity;
    }

    const keyFrame: KeyFrame = {
      position,
      ...(opacity !== undefined ? { opacity } : {}),
    };

    builder.addKeyFrame(keyFrame);
    keyFrameCount += 1;
  });

  if (keyFrameCount === 0) {
    throw new Error("<animation> must have at least one <keyFrame> child");
  }
}
