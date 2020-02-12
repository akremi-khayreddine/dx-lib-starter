#!/bin/sh
set -eu
   
RUN_ID="$RUN_ID"
TRIGGER="$TRIGGER"
TRIGGER_ID="$TRIGGER_ID"
WORKFLOW_ID="$WORKFLOW_ID" 
WEBHOOK_URL="https://us-central1-locatus-test.cloudfunctions.net/checkSuite"
JOB=$JOB

curl -X POST -H "Content-Type: application/json" 
     --data "{ \"data\": \"{ 'run_id': '$RUN_ID', 'trigger': '$TRIGGER', 'trigger_id': '$TRIGGER_ID', 'repository': '$WORKFLOW_ID', 'job': $JOB }\" }" $WEBHOOK_URL
