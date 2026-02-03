# 🌊 Development Workflow (Git Flow)

이 프로젝트는 안정적인 배포와 효율적인 협업을 위해 **Git Flow** 전략을 따릅니다.

## 1. 브랜치 전략 (Branching Strategy)

| 브랜치명 | 설명 | 비고 |
| :--- | :--- | :--- |
| `main` | 제품으로 출시될 수 있는 상태의 브랜치 (Production) | 배포 시에만 Merge |
| `develop` | 다음 출시 버전을 위해 개발을 진행하는 브랜치 | 중심 개발 브랜치 |
| `feature/*` | 새로운 기능 개발 브랜치 | `develop`에서 생성 |
| `release/*` | 출시 준비 브랜치 (버그 수정 및 메타데이터 설정) | `develop`에서 생성 |
| `hotfix/*` | 출시 버전(`main`)에서 발생한 긴급 버그 수정 | `main`에서 생성 |
| `scaffolding` | 모노리포 구성을 위한 브랜치 | `main`에 덮어쓸 예정 |

## 2. 작업 흐름 (Workflow)

### ✅ 새로운 기능 개발 (Feature)
1. `develop` 브랜치에서 최신 코드를 가져옵니다.
2. `feature/기능명` 브랜치를 생성합니다.
3. 작업 완료 후 `develop` 브랜치로 **Pull Request(PR)**를 생성하여 코드 리뷰를 거칩니다.
4. Merge가 완료된 feature 브랜치는 삭제합니다.

### 🚀 출시 준비 (Release)
1. 모든 기능이 `develop`에 반영되면 `release/v0.x.x` 브랜치를 생성합니다.
2. 버전 업데이트 및 QA를 진행합니다. (예: `package.json` 버전 수정)
3. 완료되면 `main`과 `develop` 브랜치에 각각 Merge합니다.
4. `main` 브랜치에는 해당 버전의 **Tag**를 생성합니다.

### 🚑 긴급 수정 (Hotfix)
1. `main` 브랜치에서 긴급한 버그가 발견되면 `hotfix/버그명` 브랜치를 생성합니다.
2. 수정 완료 후 `main`과 `develop` 브랜치에 각각 Merge하여 반영합니다.

## 3. 커밋 메시지 규칙 (Commit Convention)

`lint-staged`와 `husky`가 설정되어 있으므로, 다음 형식을 권장합니다.
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷 변경 (Prettier 적용 등)
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가