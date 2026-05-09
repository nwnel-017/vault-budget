"use client";

import Lottie from "lottie-react";
import styles from "./LoadingSkeleton.module.css";

const shimmerAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 800,
  h: 1200,
  nm: "dashboard-skeleton-shimmer",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Shimmer",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 0, k: 12, ix: 10 },
        p: {
          a: 1,
          k: [
            { t: 0, s: [-160, 600, 0], e: [960, 600, 0] },
            { t: 90, s: [960, 600, 0] },
          ],
          ix: 2,
        },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: { a: 0, k: [100, 100, 100], ix: 6 },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [220, 1500], ix: 2 },
              p: { a: 0, k: [0, 0], ix: 3 },
              r: { a: 0, k: 36, ix: 4 },
              nm: "Rectangle Path 1",
              mn: "ADBE Vector Shape - Rect",
              hd: false,
            },
            {
              ty: "gf",
              o: { a: 0, k: 55, ix: 10 },
              r: 1,
              bm: 0,
              g: {
                p: 3,
                k: {
                  a: 0,
                  k: [
                    0, 1, 1, 1, 0, 0.5, 1, 1, 1, 0, 1, 1, 1, 0,
                  ],
                  ix: 9,
                },
              },
              s: { a: 0, k: [-110, 0], ix: 5 },
              e: { a: 0, k: [110, 0], ix: 6 },
              t: 1,
              nm: "Gradient Fill 1",
              mn: "ADBE Vector Graphic - G-Fill",
              hd: false,
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform",
            },
          ],
          nm: "Shimmer Group",
          np: 2,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false,
        },
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0,
    },
  ],
  markers: [],
};

function SkeletonLine({ className }: { className: string }) {
  return <div className={`${styles.line} ${className}`} aria-hidden="true" />;
}

export default function LoadingSkeleton() {
  return (
    <div
      className={`flex-col gap col-center max-width ${styles.shell}`}
      aria-label="Loading dashboard"
      aria-live="polite"
    >
      <div className={styles.headingBlock}>
        <div className={styles.rangeCard} />
      </div>

      <div className={styles.cards}>
        <article className={styles.card}>
          <SkeletonLine className={styles.lineShort} />
          <SkeletonLine className={styles.lineLong} />
          <div className={styles.chartBlock} />
        </article>

        <article className={`${styles.card} ${styles.cardCompact}`}>
          <SkeletonLine className={styles.lineShort} />
          <SkeletonLine className={styles.lineMedium} />
        </article>

        <article className={`${styles.card} ${styles.cardCompact}`}>
          <SkeletonLine className={styles.lineShort} />
          <SkeletonLine className={styles.lineMedium} />
        </article>

        <article className={styles.card}>
          <SkeletonLine className={styles.lineMedium} />
          <div className={styles.chartBlock} />
          <SkeletonLine className={styles.lineTiny} />
        </article>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionTitle} />
        <div className={styles.tableHeader}>
          <SkeletonLine className={styles.rowTitle} />
          <SkeletonLine className={styles.rowAmount} />
        </div>
        <div className={styles.tableBody}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div className={styles.tableRow} key={index}>
              <div className={styles.rowMeta}>
                <SkeletonLine className={styles.rowTitle} />
                <SkeletonLine className={styles.rowSubtitle} />
              </div>
              <SkeletonLine className={styles.rowAmount} />
            </div>
          ))}
        </div>
      </section>

      <div className={styles.shimmer} aria-hidden="true">
        <Lottie animationData={shimmerAnimation} loop autoplay />
      </div>
    </div>
  );
}
