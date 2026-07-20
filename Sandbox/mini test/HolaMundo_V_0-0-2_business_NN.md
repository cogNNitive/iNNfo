---
spec_version: "V_0-2-0"
spec_url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/v0.1.5/specs/iNNfo_V_0-2-0_NN.md"
level: 3
parent_spec:
  name: "business_V_0-1-1"
  url: "https://raw.githubusercontent.com/cogNNitive/cogNNitive/v0.1.1/specs/business_V_0-1-1_NN.md"
model_version: "V_0-0-1"
title: "Hola Mundo â€” iNNfo Test"
---

> [!NOTE]
> Mini modelo de prueba para verificar que la aplicaciÃ³n carga y renderiza correctamente.

# _NN index

* _NN index: Productos
* _NN index: Clientes

# _NN Productos

* _NN Productos: iNNfo
  ```yaml
  tipo: software
  version: V_0-0-1
  ```
  La plataforma central del ecosistema iNNv0 FORMAT.

* _NN Productos: Innfo Editor
  ```yaml
  tipo: editor
  version: V_0-0-1
  ```
  Editor visual para modelos FORMAT.

# _NN Clientes

* _NN Clientes: Desarrolladores
  ```yaml
  segmento: tech
  prioridad: alta
  ```
  Equipos que modelan conocimiento con FORMAT.

* _NN Clientes: Arquitectos
  ```yaml
  segmento: enterprise
  prioridad: media
  ```
  Quienes diseÃ±an sistemas con modelos formales.

# _NN matrices: producto-cliente matrix

| Producto \ Cliente | Desarrolladores | Arquitectos |
| :--- | :---: | :---: |
| iNNfo | Core | Core |
| Innfo Editor | Core | Extended |