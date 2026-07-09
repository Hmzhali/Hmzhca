const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `  const [reboundRadarTimeframe, setReboundRadarTimeframe] = useState<"1m" | "5m" | "15m" | "30m">("5m");`,
  `  const [reboundRadarTimeframe, setReboundRadarTimeframe] = useState<"1m" | "5m" | "15m" | "30m">(() => {
    const saved = localStorage.getItem("almoharif_rebound_radar_timeframe");
    return (saved as "1m" | "5m" | "15m" | "30m") || "5m";
  });`
);

content = content.replace(
  `  useEffect(() => {
    localStorage.setItem("almoharif_quick_scalp_protector", String(quickScalpProtectorEnabled));
  }, [quickScalpProtectorEnabled]);`,
  `  useEffect(() => {
    localStorage.setItem("almoharif_quick_scalp_protector", String(quickScalpProtectorEnabled));
  }, [quickScalpProtectorEnabled]);

  useEffect(() => {
    localStorage.setItem("almoharif_rebound_radar_timeframe", reboundRadarTimeframe);
  }, [reboundRadarTimeframe]);`
);

fs.writeFileSync('src/App.tsx', content);
