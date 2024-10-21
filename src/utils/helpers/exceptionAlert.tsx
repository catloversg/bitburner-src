import React from "react";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import Typography from "@mui/material/Typography";
import { getErrorMetadata } from "../ErrorHelper";

export function exceptionAlert(e: unknown): void {
  console.error(e);
  const errorMetadata = getErrorMetadata(e);

  dialogBoxCreate(
    <>
      Caught an exception: {String(e)}
      <br />
      <br />
      {e instanceof Error && (
        <Typography component="div" style={{ whiteSpace: "pre-wrap" }}>
          Stack: {e.stack?.toString()}
        </Typography>
      )}
      Commit: {errorMetadata.version.commitHash}
      <br />
      UserAgent: {navigator.userAgent}
      <br />
      <br />
      This is a bug. Please contact developers.
    </>,
  );
}
