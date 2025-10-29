export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">
          MarketSphere
        </h1>
        <p className="text-center text-muted-foreground">
          전통시장 디지털 혁신 플랫폼
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">소상공인</h2>
            <p className="text-sm text-muted-foreground">
              AI 자동화로 마케팅 걱정 없이 본업에만 집중
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">상인회</h2>
            <p className="text-sm text-muted-foreground">
              시장 전체 데이터 분석 및 공동 마케팅
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">고객</h2>
            <p className="text-sm text-muted-foreground">
              AI 추천으로 편리한 장보기 경험
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
