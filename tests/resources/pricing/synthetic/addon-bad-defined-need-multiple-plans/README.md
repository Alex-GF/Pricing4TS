In this case we have two plans `BASIC` and `PRO` and two addons `A` and `B`.
Addon `A` can only be purchased if you subscribe to plan `BASIC`
(`availableFor: ["BASIC"]`) and to addon `B` (`dependsOn: ["B"]`).
But addon `B` can only be purchased if you subscribe to plan `PRO` (`availableFor: ["PRO"]`).
Since you can only subscribe to one plan at a time this is inconsistent.
