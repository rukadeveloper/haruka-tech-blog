---
title: 딥 러닝 - 파이토치 (5)
date: '2026-10-12'
category: AI/딥러닝
description: ''
tags: []
thumbnail: /images/posts/draft-114/1.webp
format: html
draft: true
---
<img src="https://raw.githubusercontent.com/rukadeveloper/haruka-tech-blog/main/public/images/uploads/1793521035069.png" width="258" data-align="left" style="display: block; height: auto; max-width: 100%; margin: 0px auto 0px 0px;"><h3><strong>파이토치(Pytorch)</strong></h3><p>파이토치(Pytorch)는 페이스북(메타, Meta)에서 개발한 딥 러닝 프레임워크입니다.</p><p>원래 Torch라는 프레임워크가 있었는데 이것의 Python 버전이 Pytorch입니다. </p><p>Pytorch는 다루기 쉽고, 마치 넘파이(Numpy)만 공부했어도 손쉽게 접근할 수 있도록 API가 잘 설계되었습니다.</p><p>요즘 예시로, 학술 논문 등에서  Pytorch 구현이 많아졌습니다.</p><p>생태계 측면에서도 Hugging Face 같은 사전 학습 모델들은 모두 Pytorch 기반으로 배포되고 있습니다.</p><p>초기에는 TensorFlow에 비해 배포 부분이 빈약했으나 최근 이 점이 개선되었습니다. (아직 모바일 부분은 약합니다)</p><h3><strong>텐서(Tensors)</strong></h3><p>Pytorch에서 다루는 다차원 배열 객체가 <strong>텐서(Tensor) 객체</strong>입니다. 이는 Numpy의 ndarray와 유사합니다.</p><p>그리고, 내부적으로 GPU 연산 가속이 가능합니다.</p><p>파이토치의 Tensor 객체를 사용하기 위해 torch 라이브러리를 import 합니다.</p><pre><code class="language-import torch">import torch</code></pre><p>여기서 파이토치 버전은 GPU 버전과 CPU 버전으로 나뉘는데</p><p>GPU 버전일 경우 실제 버전 뒤에 CUDA 버전이 같이 나옵니다.</p><pre><code>torch.__version__ # 2.11.0+cu130</code></pre><p>이를 기반으로 1차원, 2차원 텐서 객체를 초기화 해봅니다.</p><pre><code>x = torch.tensor([1, 2, 3, 4, 5])
x # tensor([1, 2, 3, 4, 5])</code></pre><p></p>
