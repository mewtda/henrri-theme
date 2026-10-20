# Henrri Theme

Tema Shopify da Henrri. É baseado no **Dawn 16.0.0** e copia o visual da Tailor's Mind: preto e branco, tipografia geométrica, faixa de anúncios rolando, hero com setas, carrossel de produtos com abas, categorias em grade 2x2, "Compre o look" e rodapé preto.

## Desenvolvimento

```bash
shopify theme dev --store SUA-LOJA.myshopify.com
shopify theme check
shopify theme push --unpublished --store SUA-LOJA.myshopify.com
```

## O que é da Henrri (prefixo `henrri-`)

| Arquivo | O que faz |
|---|---|
| `assets/henrri.css` | Estilo global (header, cards, botões, produto, rodapé) |
| `assets/henrri-sections.css` | Estilo das seções da home |
| `assets/henrri-carousel.js` | Carrossel (setas, bolinhas, autoplay) |
| `sections/henrri-marquee.liquid` | Faixa preta de anúncios rolando (grupo do header) |
| `sections/henrri-hero.liquid` | Hero com slides, setas e botão "Shop now" |
| `sections/henrri-product-carousel.liquid` | Carrossel de produtos com abas ("Best sellers / Lançamentos") |
| `sections/henrri-collection-tiles.liquid` | Categorias com foto, título e seta |
| `sections/henrri-benefits.liquid` | Faixa de benefícios com ícones |
| `sections/henrri-shop-the-look.liquid` | Foto do look com pontos clicáveis e os produtos ao lado |
| `sections/henrri-reviews.liquid` | Avaliações (aceita bloco de app, ex.: Judge.me) |
| `sections/henrri-instagram.liquid` | @ do Instagram e grade de fotos (aceita bloco de app) |
| `snippets/henrri-card-badges.liquid` | Selos "X% OFF" e "★ BEST SELLER" no card |
| `snippets/henrri-card-swatches.liquid` | Bolinhas de cor no card |
| `snippets/henrri-installments.liquid` | "em até 4x de R$ X sem juros" e preço no Pix |
| `snippets/henrri-floating-video.liquid` | Vídeo flutuante na página de produto |
| `snippets/henrri-icon.liquid` | Ícones de linha |

Arquivos do Dawn alterados: `layout/theme.liquid`, `snippets/card-product.liquid`, `sections/main-product.liquid`.

## Configuração na loja

- **Vídeo flutuante**: crie o metafield de produto `custom.video` (tipo **Arquivo → Vídeo**, ou URL de um .mp4). Quando o produto tem vídeo, ele aparece no canto inferior esquerdo tocando sem som. Ao clicar, abre em tela cheia com som. O "X" esconde o vídeo durante a visita. Para desligar: Produto → seção principal → "Henrri: vídeo flutuante".
- **Best seller**: produtos com a tag `best-seller` mostram o selo (Configurações do tema → Henrri).
- **Parcelamento/Pix**: Configurações do tema → Henrri (padrão: até 4x sem juros, parcela mínima de R$ 10, 5% no Pix).
- **Bolinhas de cor**: usam a opção `Cor`/`Color` do produto (swatches nativos do Shopify, nome da cor ou imagem da variante).
- **Fonte**: Jost (a Tailor's Mind usa ITC Avant Garde, que é paga). Para trocar: Configurações do tema → Tipografia.
