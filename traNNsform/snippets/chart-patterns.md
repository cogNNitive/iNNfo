# Chart.js Patterns Reutilizables

Todos los gráficos usan `Chart.js 4.4.7` via CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
```

## Patrón: Doughnut

```js
new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['A', 'B', 'C'],
    datasets: [{
      data: [n1, n2, n3],
      backgroundColor: ['#27ae60', '#3498db', '#e67e22'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { position: 'bottom' } }
  }
});
```

## Patrón: Bar agrupado

```js
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Label1', 'Label2'],
    datasets: [
      { label: 'Series 1', data: [v1, v2], backgroundColor: '#27ae60', borderRadius: 3 },
      { label: 'Series 2', data: [v3, v4], backgroundColor: '#3498db', borderRadius: 3 }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { position: 'bottom' } }
  }
});
```

## Patrón: Radar

```js
new Chart(ctx, {
  type: 'radar',
  data: {
    labels: ['Axis1', 'Axis2', 'Axis3'],
    datasets: [{
      label: 'Dataset',
      data: [v1, v2, v3],
      backgroundColor: 'rgba(39, 174, 96, 0.15)',
      borderColor: '#27ae60',
      borderWidth: 2,
      pointBackgroundColor: '#27ae60'
    }]
  },
  options: {
    responsive: true,
    scales: { r: { min: 0, max: 7, ticks: { stepSize: 1 } } },
    plugins: { legend: { position: 'bottom' } }
  }
});
```

## Patrón: Flowchart canvas

```js
(function drawFlowchart() {
  const canvas = document.getElementById('flowchart');
  const ctx = canvas.getContext('2d');
  const steps = [
    { label: 'Step 1', type: 'event' },
    { label: 'Step 2', type: 'task' },
    { label: 'Step 3', type: 'decision' }
  ];
  const typeColors = {
    event: { fill: '#d5e8d4', stroke: '#1a5c1a', text: '#1a5c1a' },
    task: { fill: '#dae8fc', stroke: '#1a3a6c', text: '#1a3a6c' },
    decision: { fill: '#ffe6cc', stroke: '#8a4a00', text: '#8a4a00' }
  };
  // Draw arrows between boxes, then draw boxes with type-specific shapes
  // For decision: diamond. For event/task: rounded rect.
  // Step number above each box.
})();
```

Ver implementation completa en `templates/procedures.md` para el código exacto del flowchart.
