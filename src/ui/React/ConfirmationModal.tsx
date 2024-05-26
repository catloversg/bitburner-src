import React from "react";
import { Modal } from "./Modal";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface IProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmationText: string | React.ReactNode;
  additionalButton?: React.ReactNode;
  autoConfirm?: boolean;
}

export function ConfirmationModal(props: IProps): React.ReactElement {
  if (props.autoConfirm) {
    props.onConfirm();
  }
  return (
    <Modal open={props.open} onClose={props.onClose}>
      <>
        <Typography>{props.confirmationText}</Typography>
        <Button
          onClick={() => {
            props.onConfirm();
          }}
        >
          Confirm
        </Button>
        {props.additionalButton && <>{props.additionalButton}</>}
      </>
    </Modal>
  );
}
