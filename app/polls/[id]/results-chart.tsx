"use client";

import { useEffect, useState } from "react";
import type { OptionTally } from "@/lib/polls-repository";

type ChartType = "bar" | "horizontal-bar" | "pie";
const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "bar", label: "막대" },
  { value: "horizontal-bar", label: "가로 막대" },
  { value: "pie", label: "파이" },
];
const STORAGE_KEY = "voting-app:results-chart-type";

function seriesColor(index: number): string {
  return `var(--viz-series-${(index % 8) + 1})`;
}

function truncate(label: string, max = 10): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

function pctOf(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

export function ResultsChart({ tallies }: { tallies: OptionTally[] }) {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "bar" || saved === "horizontal-bar" || saved === "pie") {
        // Restoring this after mount means a returning viewer who picked a
        // non-default chart sees "bar" for one frame before it corrects —
        // the documented fix (node_modules/next/dist/docs/01-app/02-guides/
        // preventing-flash-before-hydration.md) is an inline <script> plus a
        // lazy useState initializer, but that pattern assumes toggling one
        // attribute (its own example is an accordion's open/closed state).
        // Here it would mean server-rendering all three chart SVGs at once
        // so the script can pick which to reveal — tripling this component's
        // HTML for a sub-second cosmetic flash. Not worth it at this scope.
        // A lazy initializer WITHOUT the script would be worse: it reads
        // localStorage during the client's hydration pass too, so it would
        // actually mismatch the server output (the doc's anti-pattern #1,
        // a real hydration error) instead of just flashing.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setChartType(saved);
      }
    } catch {
      // localStorage unavailable — keep the default.
    }
  }, []);

  function selectChartType(type: ChartType) {
    setChartType(type);
    try {
      localStorage.setItem(STORAGE_KEY, type);
    } catch {
      // Per-viewer convenience only; fine if it doesn't persist.
    }
  }

  const total = tallies.reduce((sum, t) => sum + t.count, 0);

  return (
    <section className="viz-root flex w-full max-w-md flex-col gap-3 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          className="text-lg font-medium"
          style={{ color: "var(--viz-text-primary)" }}
        >
          결과 ({total}표)
        </h2>
        <div className="flex items-center gap-3 text-sm">
          <div
            role="group"
            aria-label="차트 종류"
            className="flex overflow-hidden rounded border border-black/[.08] dark:border-white/[.145]"
          >
            {CHART_TYPES.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={!showTable && chartType === option.value}
                onClick={() => {
                  setShowTable(false);
                  selectChartType(option.value);
                }}
                className="px-2 py-1"
                style={{
                  background:
                    !showTable && chartType === option.value
                      ? "var(--viz-series-1)"
                      : "transparent",
                  color:
                    !showTable && chartType === option.value
                      ? "#ffffff"
                      : "var(--viz-text-secondary)",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowTable((value) => !value)}
            style={{ color: "var(--viz-text-secondary)" }}
            className="underline"
          >
            {showTable ? "차트로 보기" : "표로 보기"}
          </button>
        </div>
      </div>

      {showTable ? (
        <ResultsTable tallies={tallies} total={total} />
      ) : (
        <>
          {chartType === "bar" && <BarChart tallies={tallies} total={total} />}
          {chartType === "horizontal-bar" && (
            <HorizontalBarChart tallies={tallies} total={total} />
          )}
          {chartType === "pie" && <PieChart tallies={tallies} total={total} />}
          <Legend tallies={tallies} total={total} />
        </>
      )}
    </section>
  );
}

function Legend({
  tallies,
  total,
}: {
  tallies: OptionTally[];
  total: number;
}) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {tallies.map((tally, index) => {
        const pct = pctOf(tally.count, total);
        return (
          <li key={tally.optionId} className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: seriesColor(index) }}
            />
            <span style={{ color: "var(--viz-text-primary)" }}>
              {tally.label}
            </span>
            <span style={{ color: "var(--viz-text-secondary)" }}>
              {tally.count}표 ({pct}%)
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function ResultsTable({
  tallies,
  total,
}: {
  tallies: OptionTally[];
  total: number;
}) {
  return (
    <table className="w-full text-sm" style={{ color: "var(--viz-text-primary)" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid var(--viz-gridline)" }}>
          <th className="py-1 text-left font-medium">선택지</th>
          <th className="py-1 text-right font-medium">득표수</th>
          <th className="py-1 text-right font-medium">비율</th>
        </tr>
      </thead>
      <tbody>
        {tallies.map((tally) => {
          const pct = pctOf(tally.count, total);
          return (
            <tr key={tally.optionId}>
              <td className="py-1">{tally.label}</td>
              <td className="py-1 text-right [font-variant-numeric:tabular-nums]">
                {tally.count}
              </td>
              <td className="py-1 text-right [font-variant-numeric:tabular-nums]">
                {pct}%
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const VIEW_W = 320;
const VIEW_H = 220;
const MARGIN_TOP = 20;
const MARGIN_BOTTOM = 36;

function BarChart({
  tallies,
  total,
}: {
  tallies: OptionTally[];
  total: number;
}) {
  const plotHeight = VIEW_H - MARGIN_TOP - MARGIN_BOTTOM;
  const max = Math.max(1, ...tallies.map((t) => t.count));
  const slotWidth = VIEW_W / Math.max(1, tallies.length);
  const barWidth = Math.min(24, slotWidth * 0.5);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label="선택지별 득표 수 막대 그래프"
      className="w-full"
    >
      <line
        x1={0}
        y1={MARGIN_TOP + plotHeight}
        x2={VIEW_W}
        y2={MARGIN_TOP + plotHeight}
        stroke="var(--viz-baseline)"
        strokeWidth={1}
      />
      {tallies.map((tally, index) => {
        const barHeight = (tally.count / max) * plotHeight;
        const x = index * slotWidth + slotWidth / 2 - barWidth / 2;
        const y = MARGIN_TOP + plotHeight - barHeight;
        const pct = pctOf(tally.count, total);
        return (
          <g key={tally.optionId}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 0)}
              rx={4}
              fill={seriesColor(index)}
            >
              <title>{`${tally.label}: ${tally.count}표 (${pct}%)`}</title>
            </rect>
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize={11}
              fill="var(--viz-text-secondary)"
            >
              {tally.count}
            </text>
            <text
              x={index * slotWidth + slotWidth / 2}
              y={MARGIN_TOP + plotHeight + 16}
              textAnchor="middle"
              fontSize={11}
              fill="var(--viz-text-muted)"
            >
              {truncate(tally.label)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function HorizontalBarChart({
  tallies,
  total,
}: {
  tallies: OptionTally[];
  total: number;
}) {
  const rowHeight = 28;
  const height = tallies.length * rowHeight + 8;
  const labelWidth = 88;
  const plotWidth = VIEW_W - labelWidth - 36;
  const max = Math.max(1, ...tallies.map((t) => t.count));

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${height}`}
      role="img"
      aria-label="선택지별 득표 수 가로 막대 그래프"
      className="w-full"
    >
      {tallies.map((tally, index) => {
        const barWidth = (tally.count / max) * plotWidth;
        const y = index * rowHeight + 4;
        const pct = pctOf(tally.count, total);
        return (
          <g key={tally.optionId}>
            <text
              x={labelWidth - 6}
              y={y + 16}
              textAnchor="end"
              fontSize={11}
              fill="var(--viz-text-muted)"
            >
              {truncate(tally.label, 12)}
            </text>
            <rect
              x={labelWidth}
              y={y}
              width={Math.max(barWidth, 0)}
              height={20}
              rx={4}
              fill={seriesColor(index)}
            >
              <title>{`${tally.label}: ${tally.count}표 (${pct}%)`}</title>
            </rect>
            <text
              x={labelWidth + barWidth + 6}
              y={y + 15}
              fontSize={11}
              fill="var(--viz-text-secondary)"
            >
              {tally.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function PieChart({
  tallies,
  total,
}: {
  tallies: OptionTally[];
  total: number;
}) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  const strokeWidth = 40;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="선택지별 득표 비율 파이 그래프"
      className="mx-auto w-full max-w-[220px]"
    >
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="transparent"
          stroke="var(--viz-gridline)"
          strokeWidth={strokeWidth}
        />
        {total > 0 &&
          tallies.map((tally, index) => {
            const fraction = tally.count / total;
            if (fraction === 0) return null;
            const dash = fraction * circumference;
            const offset = -cumulative;
            cumulative += dash;
            const pct = pctOf(tally.count, total);
            return (
              <circle
                key={tally.optionId}
                cx={cx}
                cy={cy}
                r={r}
                fill="transparent"
                stroke={seriesColor(index)}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={offset}
              >
                <title>{`${tally.label}: ${tally.count}표 (${pct}%)`}</title>
              </circle>
            );
          })}
      </g>
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={16}
        fontWeight={600}
        fill="var(--viz-text-primary)"
      >
        {total}표
      </text>
    </svg>
  );
}
