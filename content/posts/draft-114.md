---
title: 딥 러닝 - 파이토치 (5)
date: '2026-10-12'
category: AI/딥러닝
description: >-
  파이토치(PyTorch) 파이토치는 페이스북(현, 메타)에서 개발한 딥 러닝 프레임워크입니다. 원래 토치(Torch)라는 프레임워크가
  있었는데 이것의 파이썬(Python) 버젼이 파이토치(PyTorch)입니다. 파이
tags: []
thumbnail: /images/posts/draft-114/1.webp
format: html
draft: true
---
<p><img src="/images/posts/draft-114/1.webp" alt=""></p>
<p><strong>파이토치(PyTorch)</strong></p>
<p>파이토치는 페이스북(현, 메타)에서 개발한 딥 러닝 프레임워크입니다.</p>
<p>원래 토치(Torch)라는 프레임워크가 있었는데 이것의 파이썬(Python) 버젼이 파이토치(PyTorch)입니다.</p>
<p>파이토치는 텐서플로(TensorFlow)에 비해 다루기 쉬워, 넘파이(NumPy)만 공부했어도 쉽게 접근할 수 있도록 설계되었습니다.</p>
<p>2025년 기준 파이토치(PyTorch)는 신경망을 세세하게 제어할 수 있어 학술 논문에서 파이토치 구현이 많아지고 있습니다.</p>
<p>생태계 측면에서도 허깅 페이스(Hugging Face) 같은 사전 학습 모델도 파이토치를 지원하고 있습니다.</p>
<p><strong>텐서(Tensors)</strong></p>
<p>넘파이(NumPy) 때 다차원 배열(ndarray)을 위한 기본 구조로 텐서(Tensor)를 사용했었습니다.</p>
<p>유사하게 파이토치에서의 다차원 배열 객체가 있는데, 그 이름이 텐서(Tensor) 입니다.</p>
<p>내부적으로 GPU 연산 가속(CUDA)이 가능해서 연산 속도가 빠릅니다.</p>
<p>텐서의 기본에 대해 알아보기 위해 파이토치를 먼저 임포트하겠습니다.</p>
<pre><code class="language-python">import torch
</code></pre>
<p>tensor() 통해 사용자가 입력한 값으로 텐서(Tensor)를 초기화할 수 있습니다.</p>
<p>1차원 텐서 객체를 만듭니다.</p>
<pre><code class="language-python">x = torch.tensor([1, 2, 3, 4, 5]) # tensor([1, 2, 3, 4, 5])
</code></pre>
<p>2차원 텐서 객체를 만듭니다.</p>
<pre><code class="language-python">y = torch.tensor([[10.0, 10.1, 10.2], [20.0, 20.1, 20.2]])
'''
tensor([[10.0000, 10.1000, 10.2000],
        [20.0000, 20.1000, 20.2000]])
'''
</code></pre>
<p>텐서 객체는 ndarray과 유사하게 shape, size(), ndim, dtype, numpy(), numel()에 접근할 수 있습니다.</p>
<p>type()을 통해 Tensor 객체임을 확인합니다.</p>
<pre><code class="language-python">type(x) # torch(Tensor)
</code></pre>
<p>그리고, shape는 튜플이 아니라 Size 객체로 반환됩니다.</p>
<pre><code class="language-python">x.shape # torch.Size([5])
y.shape # torch.Size([2, 3])
</code></pre>
<p>그리고, size() 역시 Size 객체를 반환합니다.</p>
<pre><code class="language-python">x.size() # torch.Size([5])
</code></pre>
<p>ndim은 ndarray와 동일하게 차원레벨을 반환합니다.</p>
<pre><code class="language-python">x.ndim # 1
</code></pre>
<p>dtype 속성은 ndarray와 동일하게 하나의 데이터 타입을 반환합니다.</p>
<pre><code class="language-python">x.dtype # torch.int64
</code></pre>
<p>numel() 함수는 torch에만 있는 속성으로 원소의 총 개수를 반환합니다. 넘파이에서의 size() 함수의 역할이었습니다.</p>
<pre><code class="language-python">x.numel() # 5
</code></pre>
<p>numpy() 함수는 numpy 객체로 리턴해주는 역할을 합니다.</p>
<pre><code class="language-python">x.numpy() # array([1, 2, 3, 4, 5])
</code></pre>
<p>tolist() 함수로 리스트로 변환할 수도 있습니다.</p>
<pre><code class="language-python">x.tolist() # [1, 2, 3, 4, 5]
</code></pre>
<p>마지막으로, item() 함수를 통해 텐서에 값이 단 하나만 존재하면 스칼라값을 얻을 수 있습니다.</p>
<pre><code class="language-python">x = torch.tensor([[[1]]])
x.item() # 1
</code></pre>
<p>파이토치(PyTorch)는 텐서(Tensors) 간의 연산 최적화를 위해 텐서를 CPU 메모리 상에서 실행시킬 수도 있고</p>
<p>혹은 GPU 상에서 실행시킬 수도 있습니다. 즉, CPU 혹은 GPU에서 실행시킬지 정할 수 있습니다.</p>
<p>상황에 따라, to() 함수를 써서 텐서를 CPU 혹은 GPU에 옮길 수 있습니다.</p>
<p>특정 장치나 특정 자료형으로 변환하는 역할을 합니다. 텐서는 동일한 디바이스에 있는 텐서끼리만 연산이 됩니다.</p>
<p>어떤 1차원 텐서를 생성해보겠습니다.</p>
<pre><code class="language-python">x = torch.randn(1)
print(x) # torch([1.2179])
print(x.item()) # 1.2179
print(x.dtype) # torch.float32
</code></pre>
<p>디바이스를 지정하기 위해 device() 함수를 사용해서 CPU 및 CUDA 디바이스를 정의합니다.</p>
<pre><code class="language-python">torch.device('cpu') # device(type='cpu')
torch.device('cuda') # device(type='cuda')
</code></pre>
<p>CUDA 사용 가능 여부에 따라 CPU 및 CUDA를 사용하도록 합니다.</p>
<pre><code class="language-python">DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
</code></pre>
<p>필자는 현재 Windows 환경에서 진행중이므로 CPU가 정의됩니다.</p>
<pre><code class="language-python">print(DEVICE) # cpu
</code></pre>
<p>현재 위에서 만든 x라는 1차원 텐서 객체는 기본적으로 CPU에 만들어진 것입니다.</p>
<p>하지만, 텐서를 초기화할 때 device 변수를 넣을 수 있습니다.</p>
<p>(현재 우리는 CPU로 정의되므로, 무조건 CPU로 만들어지나, Colab 환경에서 CUDA 옵션일 경우 변경할 수 있습니다)</p>
<p>1로 채우며, device 옵션을 주는 1차원 배열을 새로 초기화하겠습니다.</p>
<pre><code class="language-python">y = torch.ones_like(x, device=DEVICE)
# tensor([1.])
# CUDA 일 경우, tensor([1.], device='cuda:0')
</code></pre>
<p>참고로 여기서 CUDA로 옮겨진 y와 CPU로 옮겨진 x끼리의 연산은 불가합니다.</p>
<pre><code class="language-python">x + y # Runtime Error: Expected all tensors to be on the same device
</code></pre>
<p>파이토치(PyTorch)에 중요한 기능 중에 하나인 자동 미분(Autograd)이 있습니다.</p>
<p>텐서의 모든 연산에 대해 미분을 제공하며, 역전파 과정에서 기울기를 구하는 과정을 의미합니다.</p>
<p>우선 텐서에 requires_grad 라는 속성이 있습니다.</p>
<p>이것을 True로 설정하면, 해당 텐서에서 이루어지는 모든 연산을 추적합니다.</p>
<p>텐서에 manual_seed()를 통해 먼저 시드값을 고정시키고 3 x 3 2차원 텐서를 만듭니다.</p>
<pre><code class="language-python">torch.manual_seed(42)
x = torch.randn(3, 3)
</code></pre>
<p>초기에 requires_grad 값은 False 입니다. 즉, W값을 구하지 않습니다.</p>
<pre><code class="language-python">print(x.requires_grad) # False
</code></pre>
<p>이제 기존 requires_grad 값을 True로 변경합니다.</p>
<pre><code class="language-python">x.requires_grad = True
</code></pre>
<p>제곱의 합 연산을 x에 대해 수행한 후, grad_fn을 통해 미분값을 계산한 함수에 대한 정보를 확인합니다.</p>
<pre><code class="language-python">y = (x * x).sum()
y # tensor(7.0298, grad_fn=&#x3C;SumBackward0>)
</code></pre>
<p>y 값의 속성에 grad_fn 속성이 생기며, 마지막 연산에 대한 기록입니다. 즉, 어떤 연산에 대해 역전파 했는지 기록합니다.</p>
<p>이제 실질적으로 기울기(W)를 계산해보겠습니다.</p>
<p>3 x 3 크기의 1로만 구성된 2차원 텐서를 만들어봅니다. 연산에 대한 역추적 역시 True로 설정합니다.</p>
<pre><code class="language-python">x = torch.ones(3, 3, requires_grad=True)

'''
tensor([[1., 1., 1.],
        [1., 1., 1.],
        [1., 1., 1.]], requires_grad=True)
'''
</code></pre>
<p>이제 x에 대한 연산에 대해 역전파를 통한 연산 기록 추적이 가능합니다.</p>
<p>y에는 +5 연산을, z에는 제곱 연산을, out에는 제곱의 평균 연산을 수행해봅니다.</p>
<pre><code class="language-python">y = x + 5
z = y * y
out = z.mean()
</code></pre>
<p>각 연산에 대해 연산 기록 추적이 되는지 확인합니다.</p>
<pre><code class="language-python">print(y) 
'''
tensor([[6., 6., 6.],
        [6., 6., 6.],
        [6., 6., 6.]], grad_fn=&#x3C;AddBackward0>)
'''

print(z)
'''
tensor([[36., 36., 36.],
        [36., 36., 36.],
        [36., 36., 36.]], grad_fn=&#x3C;MulBackward0>)
'''

print(out)
'''
tensor(36., grad_fn=&#x3C;MeanBackward0>)
'''
</code></pre>
<p>이제 backward() 통해 역전파 후, x의 계산된 기울기 값을 grad를 통해 확인합니다.</p>
<pre><code class="language-python">out.backward()
print(x.grad)
'''
tensor([[1.3333, 1.3333, 1.3333],
        [1.3333, 1.3333, 1.3333],
        [1.3333, 1.3333, 1.3333]])
'''
</code></pre>
<p>모델을 학습할 때는 기울기 업데이트가 필요하지만, 모델을 추론하거나 예측할 때는 기울기 업데이트가 필요없습니다.</p>
<p>이 때, with torch.no_grad()로 감싸서 코드를 적어주면 됩니다. </p>
<pre><code class="language-python">print((x ** 2).requires_grad) # True

with torch.no_grad():
  print((x ** 2).requires_grad) # False
</code></pre>
<p>requires_grad가 True인 상태에서는 그 안에 있는 내용물(Contents)를 꺼낼 수 없습니다. </p>
<p>꺼내려면 detach() 함수를 사용합니다. detach()되면 더 이상 W값 계산을 하지 않습니다.</p>
<pre><code class="language-python">print(x.requires_grad) # True

# x.numpy() # Can't call numpy() on Tensor that requires Grad. Use tensor .detach() instead

w = x.detach()

print(w.requires_grad) # False

w.numpy()

'''
array([[1., 1., 1.],
       [1., 1., 1.],
       [1., 1., 1.]], dtype=float32)
'''
</code></pre>
<p>파이토치(PyTorch)에서는 데이터 준비를 위해 Dataset과 DataLoader 객체를 이용하는 것을 적극 권장합니다.</p>
<p>파이토치 Dataset에는 입문자들을 위해 기본적인 데이터셋들이 제공됩니다.</p>
<pre><code class="language-python">from torch.utils.data import Dataset, DataLoader, random_split
</code></pre>
<p>또한, 파이토치에서 제공해주는 데이터셋이 모여있는 torchvision이라는 패키지가 있습니다.</p>
<pre><code class="language-python">import torchvision.transforms as transforms
from torchvision import datasets
</code></pre>
<p>Dataset을 DataLoader에 탑재할 때 적용할 transform을 정의할 수 있습니다.</p>
<p>transforms 안에 있는 Compose 객체를 통해서 정의해야 합니다. 매개변수로 리스트를 받습니다.</p>
<p>먼저, Resize(tuple)을 통해 입력 데이터를 width x height으로 바꾸는 역할을 합니다.</p>
<p>그리고, ToTensor()가 많은 역할을 하는데 다음과 같은 역할을 합니다.</p>
<ul>
<li>자료형 변환 -> 입력값이 주어졌을 때 이것을 torch.FloatTensor(dtype=float32)로 변환합니다.</li>
<li>이미지가 (h, w, channel)로 주어질 때, 파이토치 텐서로 (channel, h, w)로 변환합니다.</li>
<li>값 범위를 0 ~ 255 정수값을 0 ~ 1 실수값으로 스케일링 해줍니다.</li>
</ul>
<p>Normalize()를 통해 평균값 1/2로, 표준편차를 1/2로 하여 [-1, 1]로 전처리합니다.</p>
<p>[-1, 1] 사이가 되면 평균이 0으로 가까워져 Relu나 tanh 같은 활성화 함수에서 학습효율이 더 높아지기 때문입니다.</p>
<pre><code class="language-python">minst_transform = transforms.Compose([
  transforms.Resize((28, 28)), # 입력 데이터를 28 x 28로 바꿉니다.
  transforms.ToTensor(),
  transforms.Normalize(mean=(0.5,), std=(0.5,))
])
</code></pre>
<p>같은 코드를 아래와 같이도 정의할 수 있습니다.</p>
<pre><code class="language-python">transform_config = {
  "resize": (28, 28),
  "mean": [0.5],
  "std": [0.5]
}

mnist_transform = transforms.Compose([
  transforms.Resize(transform_config["resize"]),
  transforms.ToTensor(),
  transforms.Normalize(mean=transform_config["mean"], std=transform_config["std"])
])
</code></pre>
<p>이것을 바탕으로 데이터셋을 정의해보겠습니다.</p>
<pre><code class="language-python">train_dataset = datasets.FashionMNIST(
  root='./data',
  train=True,
  download=True,
  transform=mnist_transform
)

test_dataset = datasets.FashionMNIST(
  root='./data',
  train=False,
  download=True,
  transform=mnist_transform
)
</code></pre>
<p><img src="/images/posts/draft-114/2.png" alt=""></p>
<p>훈련용 데이터의 개수와 테스트용 데이터의 개수를 확인합니다.</p>
<pre><code class="language-python">len(train_dataset), len(test_dataset) # (60000, 10000)
</code></pre>
<p>데이터의 입력 데이터값과 타겟 데이터값을 확인합니다.</p>
<pre><code class="language-python">print(train_dataset.data.shape) # torch.Size([60000, 28, 28])
print(train_dataset.targets.shape) # torch.Size([60000])
</code></pre>
<p>데이터의 레이블 값을 확인합니다.</p>
<pre><code class="language-python">classes = train_dataset.classes

'''
['T-shirt/top',
 'Trouser',
 'Pullover',
 'Dress',
 'Coat',
 'Sandal',
 'Shirt',
 'Sneaker',
 'Bag',
 'Ankle boot']
'''
</code></pre>
<p>훈련 데이터에서 학습 및 검증 데이터를 분리해보겠습니다. random_split() 함수를 사용합니다.</p>
<p>먼저 독립적인 난수 시퀀스를 생성합니다.</p>
<pre><code class="language-python">generator = torch.Generator().manual_seed(42)
</code></pre>
<p>학습 데이터셋을 85%는 학습용으로, 15%는 검증용으로 분할합니다.</p>
<pre><code class="language-python">train_dataset_size = int(len(train_dataset) * 0.85)
validation_dataset_size = int(len(train_dataset) * 0.15)

train_dataset, validation_dataset = random_split(
  train_dataset, [train_dataset_size, validation_dataset_size], generator=generator
)
</code></pre>
<p>이제 DataLoader 통해 데이터 전체를 보관했다가 실제 모델 학습할 때 batch_size 만큼 데이터를 가져옵니다.</p>
<pre><code class="language-python">BATCH_SIZE = 64

train_loader = DataLoader(
  dataset=train_dataset,
  batch_size=BATCH_SIZE,
  shuffle=True, # 매 에포크마다 데이터 순서를 섞을지 여부
  generator=generator,
  num_workers=2 # 데이터 로딩에 사용할 subprocess 개수 (병렬 동작)
)

validation_loader = DataLoader(
  dataset=validation_dataset,
  batch_size=BATCH_SIZE,
  shuffle=True,
  generator=generator
)

test_loader = DataLoader(
  dataset=test_dataset,
  batch_size=BATCH_SIZE,
  shuffle=False
)
</code></pre>
<p>train_loader, validation_loader, test_loader는 Batch 단위로 계산합니다.</p>
<pre><code class="language-python">len(train_loader), len(test_loader) # (797, 157) &#x3C;- Batch 개수
</code></pre>
<p>첫번째 Batch를 꺼낼 때 iter()를 사용합니다. 이는 입력 데이터값과 레이블 값을 튜플로 리턴합니다.</p>
<pre><code class="language-python">images, labels = next(iter(train_loader))
</code></pre>
<p>각각의 shape를 찍어보겠습니다. 파이토치에서는 (batch, channel, height, width) 임을 명심하시기 바랍니다.</p>
<pre><code class="language-python">print(images.shape, labels.shape) # torch.Size([64, 1, 28, 28]) torch.Size([64])
</code></pre>
<p>시각화를 위해 Size가 1인 차원 즉, Channel를 제거하겠습니다.</p>
<pre><code class="language-python">torch_image = torch.squeeze(images[0])
</code></pre>
<p>시각화 합니다.</p>
<pre><code class="language-python">figure = plt.figure(figsize=(15, 30))

cols, rows = 4, 8

for i in range(cols * rows):
  img = images[i]
  label = datasets.FashionMNIST.classes[labels[i]]
  figure.add_subplot(rows, cols, i + 1)
  plt.title(label)
  plt.axis('off')
  plt.imshow(img.squeeze(), cmap='gray')
  
plt.show()
</code></pre>
<p><img src="/images/posts/draft-114/3.png" alt=""></p>
<p><strong>모델 정의</strong></p>
<p>거의 대부분의 학습된 Layer들이 nn 안에 속해있으므로, 이를 불러옵니다.</p>
<pre><code class="language-python">from torch import nn
</code></pre>
<p>파이토치(PyTorch)로 모델을 만들 때는 클래스(Class)를 정의합니다.</p>
<pre><code class="language-python">class MyCNNModel(nn.Module):
  
  def __init__(self):
    """
    모델에 사용되는 레이어들 정의
    """
    super().__init__()
    
    # 입력: 1채널(흑백) 28x28 이미지
    # conv1: (32채널, 3x3 커널), 출력 28x28
    self.conv1 = nn.Conv2d(in_channels=1, out_channels=32, kernel_size=3, padding=1)
    
    # conv2: (64채널, 3x3 커널), 출력 14x14
    self.conv2 = nn.Conv2d(in_channels=32, out_channels=64, kernel_size=3, padding=1)
    
    # pooling layer: 크기 절반으로 줄임
    self.pooling = nn.MaxPool2d(kernel_size=2, stride=2)
    
    # 완전 연결(은닉층)
    self.fc1 = nn.Linear(in_features=64*7*7, out_features=256)
    
    # 완전 연결(출력층)
    self.fc2 = nn.Linear(in_features=256, out_features=10)
    
    # 드롭아웃 (랜덤으로 출력 끄기)
    self.dropout25 = nn.Dropout(p=0.25)
    self.dropout50 = nn.Dropout(p=0.5)
  
  def forward(self, data):
    """
    모델 입력 데이터의 순전파 정의
    """
    # Feature Extraction
    # 합성곱 -> ReLU -> 풀링 -> 드롭아웃
    data = self.conv1(data)
    data = torch.relu(data)
    data = self.pooling(data)
    data = self.dropout25(data)
    
    data = self.conv2(data)
    data = torch.relu(data)
    data = self.pooling(data)
    data = self.dropout25(data)
    
    # Classification
    # Fully Connected Layer 2개 거쳐 10 클래스에 대한 Logit 출력
    data.view(-1, 7 * 7 * 64) # 1차원으로 펼치기
    data = self.fc1(data)
    data = torch.relu(data)
    data = self.dropout50(data)
    
    logits = self.fc2(data)
    
    return logits
</code></pre>
<p>모델을 GPU로 이동합니다. (GPU 환경에서만 적용됩니다.)</p>
<pre><code class="language-python">model = MyCNNModel().to(DEVICE)
</code></pre>
<p>여기서, 모델 파라미터를 확인하기 위해 named_children() 함수로 iterable 객체를 받습니다.</p>
<pre><code class="language-python">for name, child in model.named_children():
  print('>' + name)
  
  for param_name, param in child.named_parameters():
    print('  :' + f'{param_name:9s}' + ":" + f'{param.numel():,}개')
</code></pre>
<p><img src="/images/posts/draft-114/4.png" alt=""></p>
<p>이제 학습을 준비하기 위한 Optimizer와 손실 함수를 준비합니다.</p>
<pre><code class="language-python">loss_function = nn.CrossEntropyLoss()

optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
</code></pre>
