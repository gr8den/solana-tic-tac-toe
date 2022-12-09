import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { IStats } from '../types/game';

export const Stats: FC<{stats: IStats}> = ({stats}) => {
  return <div>
    <h1>Stats</h1>
    <div>Games count: {stats.gamesCount.toString()}</div>
  </div>
};
