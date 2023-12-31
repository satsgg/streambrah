import { useHotkeys } from "react-hotkeys-hook";
import {
  ActionHandler,
  Actions,
  COMMENTS_VIEW,
  PageView,
  PLAYER_VIEW,
  getPageActions,
} from "../lib/shared";
import DPad from "./DPad";
import { Dispatch, SetStateAction, useState } from "react";

const PlayerControls: React.FC<{
  currentPage: PageView;
  selectedActionIndex: number;
  setSelectedActionIndex: Dispatch<SetStateAction<number>>;
  playHandler: () => void;
  skipHandler: () => void;
  zapHandler: () => void;
  confirmZapAmount: () => void;
  confirmZapComment: () => void;
  toggleViewHandler: (currentPage: PageView) => void;
  centerButtonPressedState: ReturnType<typeof useState<boolean>>;
  commenterPublicKey?: string;
}> = ({
  currentPage,
  selectedActionIndex,
  setSelectedActionIndex,
  playHandler,
  skipHandler,
  zapHandler,
  toggleViewHandler,
  confirmZapAmount,
  confirmZapComment,
  centerButtonPressedState,
  commenterPublicKey,
}) => {
  const actionHandlerMap: Record<Actions, ActionHandler> = {
    PLAY: playHandler,
    PAUSE: playHandler,
    ZAP: zapHandler,
    NEXT: skipHandler,
    ">": () => toggleViewHandler(COMMENTS_VIEW),
    "<": () => toggleViewHandler(PLAYER_VIEW),
    CONFIRM_AMOUNT: confirmZapAmount,
    CONFIRM_COMMENT: confirmZapComment,
    COMMENTS: () => toggleViewHandler(COMMENTS_VIEW),
    // ON: () => toggleViewHandler(PLAYER_VIEW),
    // OFF: () => toggleViewHandler(OFF_VIEW),
  };

  const filteredActions = getPageActions(currentPage);

  const calcMoveIndexRight = (index: number) =>
    index + 1 >= filteredActions.length ? index : index + 1;
  const calcMoveIndexLeft = (index: number) =>
    index === 0 ? index : index - 1;

  const upHandler = () => {};
  const downHandler = () => {};

  const centerHandler = () => {
    const action = actionHandlerMap[filteredActions[selectedActionIndex]];
    try {
      action?.();
    } catch (e) {
      console.log("Error in centerHandler", e);
    }
  };
  const leftHandler = () =>
    setSelectedActionIndex((selectedActionIndex) =>
      calcMoveIndexLeft(selectedActionIndex)
    );
  const rightHandler = () =>
    setSelectedActionIndex((selectedActionIndex) =>
      calcMoveIndexRight(selectedActionIndex)
    );

  useHotkeys("enter,space", centerHandler, { scopes: ["player"] });
  useHotkeys("leftarrow", leftHandler, { scopes: ["player"] });
  useHotkeys("rightarrow", rightHandler, { scopes: ["player"] });
  useHotkeys("p", playHandler, { scopes: ["player"] });

  return (
    <div className="relative mx-auto my-4 w-40 border-8 border-black p-0">
      <DPad
        upHandler={upHandler}
        leftHandler={leftHandler}
        centerHandler={centerHandler}
        rightHandler={rightHandler}
        downHandler={downHandler}
        centerButtonPressedState={centerButtonPressedState}
      />
      {/* Controls Border Cutouts */}
      <div className="absolute -left-2 -top-2 h-2 w-2 bg-wavgray"></div>
      <div className="absolute -right-2 -top-2 h-2 w-2 bg-wavgray"></div>
      <div className="absolute -bottom-2 -left-2 h-2 w-2 bg-wavgray"></div>
      <div className="absolute -bottom-2 -right-2 h-2 w-2 bg-wavgray"></div>
    </div>
  );
};

export default PlayerControls;
